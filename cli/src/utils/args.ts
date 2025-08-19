import { readFileSync } from "fs";
import { parse } from "ts-command-line-args";
import { testCaseSchema, type TestCase } from "../types/test-case";
import z from "zod";
import { logger } from "./logger";

// Parse CLI arguments.
const args = parse<{
    testsPath: string;
    resultsPath?: string;
    verbose: boolean;
    maxTurns: number;
    screenshots: boolean;
}>({
    testsPath: {
        type: String,
        description: "Path to the tests file",
        alias: "t",
    },
    resultsPath: {
        type: String,
        description: "Path to the results file",
        alias: "o",
        optional: true,
    },
    verbose: {
        type: Boolean,
        description: "Verbose output, including all Claude Code messages.",
        alias: "v",
    },
    maxTurns: {
        type: Number,
        description: "Maximum number of turns Claude Code can take for each test case.",
        defaultValue: 30,
    },
    screenshots: {
        type: Boolean,
        description: "Take screenshots of the browser at each step.",
        defaultValue: false,
    },
});

// Read in the test file.
const testCasesJson = readFileSync(args.testsPath, "utf8");
let testCases: TestCase[];
try {
    testCases = z.array(testCaseSchema).parse(JSON.parse(testCasesJson));
} catch (error) {
    logger.error("Error parsing cases from tests file.", { error });
    process.exit(1);
}

const inputs = {
    testCases,
    resultsPath: args.resultsPath || `./results/${new Date().getMilliseconds()}`,
    verbose: args.verbose,
    maxTurns: args.maxTurns,
    screenshots: args.screenshots,
};

export { inputs };
