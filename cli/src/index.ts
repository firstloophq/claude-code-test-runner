import { MCPStateServer } from "./mcp/test-state/server";
import { inputs } from "./utils/args";
import { startTest } from "./prompts/start-test";
import { logger } from "./utils/logger";
import { TestReporter } from "./utils/test-reporter";

// Start the MCP state server.
// This manages the state for the active test case.
const server = new MCPStateServer(3001);
await server.start();

const reporter = new TestReporter();

logger.info(`Detected ${inputs.testCases.length} test cases.`);
for (const testCase of inputs.testCases) {
    const startTime = new Date();
    logger.info("Starting test case", {
        test_id: testCase.id,
    });
    server.setTestState(testCase);

    for await (const message of startTest()) {
        logger.debug("Received Claude Code message", {
            test_id: testCase.id,
            message: JSON.stringify(message),
        });
    }

    const testState = server.getState();
    if (!testState) {
        logger.error("test_state_not_found", {
            test_id: testCase.id,
        });
        throw new Error(`Test state not found for '${testCase.id}'`);
    }

    const endTime = new Date();
    reporter.addTestResult(testState, startTime, endTime);

    logger.info("completed_test_case", {
        ...testState,
        succeeded: testState?.steps.every((step) => step.status === "passed"),
    });
}

// Generate and save test reports
reporter.saveResults(inputs.resultsPath);
