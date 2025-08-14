import { mkdirSync, writeFileSync } from "fs";
import type { TestCase } from "../types/test-case";
import type { Report, Test } from "ctrf/types/ctrf";

/**
 * A class for reporting test results.
 */
export class TestReporter {
    private results: {
        testCase: TestCase;
        startTime: Date;
        endTime: Date;
        succeeded: boolean;
    }[] = [];

    /**
     * Add a test result to the reporter.
     * @param testCase - The test case to add.
     * @param startTime - The start time of the test.
     * @param endTime - The end time of the test.
     */
    addTestResult(testCase: TestCase, startTime: Date, endTime: Date): void {
        const succeeded = testCase.steps.every((step) => step.status === "passed");
        this.results.push({
            testCase,
            startTime,
            endTime,
            succeeded,
        });
    }

    /**
     * Generate CTRF (Common Test Result Format) JSON output.
     * Modern JSON format that's becoming the standard for test reporting.
     * @returns The CTRF report.
     */
    generateCTRF(): Report {
        const totalTests = this.results.reduce((sum, r) => sum + r.testCase.steps.length, 0);
        const passed = this.results.reduce((sum, r) => sum + r.testCase.steps.filter((s) => s.status === "passed").length, 0);
        const failed = this.results.reduce((sum, r) => sum + r.testCase.steps.filter((s) => s.status === "failed").length, 0);
        const pending = this.results.reduce((sum, r) => sum + r.testCase.steps.filter((s) => s.status === "pending").length, 0);

        const tests: Test[] = [];
        for (const result of this.results) {
            const testTime = (result.endTime.getTime() - result.startTime.getTime()) / 1000;

            for (const step of result.testCase.steps) {
                const stepTime = testTime / result.testCase.steps.length;

                tests.push({
                    name: step.description,
                    status: step.status === "passed" ? "passed" : step.status === "failed" ? "failed" : "skipped",
                    duration: Math.round(stepTime * 1000), // CTRF uses milliseconds
                    start: result.startTime.getTime(),
                    stop: result.endTime.getTime(),
                    suite: result.testCase.id,
                    message: step.error || undefined,
                    trace: step.error ? step.error : undefined,
                });
            }
        }

        return {
            reportFormat: "CTRF",
            specVersion: "0.0.0",
            results: {
                tool: {
                    name: "claude-code-tests",
                    version: "1.0.0",
                },
                summary: {
                    tests: totalTests,
                    passed,
                    failed,
                    pending,
                    skipped: pending, // treating pending as skipped for CTRF
                    other: 0,
                    start: this.results[0]?.startTime.getTime() || Date.now(),
                    stop: this.results[this.results.length - 1]?.endTime.getTime() || Date.now(),
                },
                tests,
            },
        };
    }

    /**
     * Generate a markdown summary for GitHub Actions job summary.
     * @returns The markdown summary.
     */
    generateMarkdownSummary(): string {
        let markdown = "# Test Results\n\n";

        const totalTests = this.results.length;
        const passedTests = this.results.filter((r) => r.succeeded).length;
        const failedTests = totalTests - passedTests;

        markdown += `## Summary\n`;
        markdown += `- **Total Test Cases**: ${totalTests}\n`;
        markdown += `- **Passed**: ${passedTests} ✅\n`;
        markdown += `- **Failed**: ${failedTests} ❌\n\n`;

        markdown += `## Detailed Results\n\n`;

        for (const result of this.results) {
            const icon = result.succeeded ? "✅" : "❌";
            const duration = ((result.endTime.getTime() - result.startTime.getTime()) / 1000).toFixed(2);

            markdown += `### ${icon} ${result.testCase.id}\n`;
            markdown += `**Duration**: ${duration}s\n\n`;
            markdown += `**Description**: ${result.testCase.description}\n\n`;

            if (result.testCase.steps.length > 0) {
                markdown += `<details>\n<summary>Steps (${result.testCase.steps.length})</summary>\n\n`;
                markdown += `| Step | Description | Status |\n`;
                markdown += `|------|-------------|--------|\n`;

                for (const step of result.testCase.steps) {
                    const stepIcon = step.status === "passed" ? "✅" : step.status === "failed" ? "❌" : "⏳";
                    markdown += `| ${step.id} | ${step.description} | ${stepIcon} ${step.status || "pending"} |\n`;

                    if (step.error) {
                        markdown += `| | Error: ${step.error} | |\n`;
                    }
                }

                markdown += `\n</details>\n\n`;
            }
        }

        return markdown;
    }

    /**
     * Save all test outputs to files.
     * @param outputDir - The directory to save the results to.
     */
    saveResults(outputDir: string): void {
        // Save CTRF JSON
        const ctrf = this.generateCTRF();
        mkdirSync(outputDir, { recursive: true });
        writeFileSync(`${outputDir}/ctrf-report.json`, JSON.stringify(ctrf, null, 2));

        // Save Markdown summary
        const markdown = this.generateMarkdownSummary();
        mkdirSync(outputDir, { recursive: true });
        writeFileSync(`${outputDir}/test-summary.md`, markdown);
    }
}
