import { which } from "bun";
import { systemPrompt } from "./system";
import { query } from "@anthropic-ai/claude-code";
import { inputs } from "../utils/args";
import type { TestCase } from "../types/test-case";

/**
 * Initiates a Claude Code query to start a test execution.
 * @param testCase - The test case to start.
 * @returns The Claude Code query.
 * @throws {Error} If Claude is not found on path.
 */
export const startTest = (testCase: TestCase) => {
    const claudePath = which("claude");
    if (!claudePath) {
        throw new Error("Claude not found on PATH. Did you run `bun install`?");
    }
    return query({
        prompt: "Query the test plan from mcp__testState__get_test_plan MCP tool to get started.",
        options: {
            customSystemPrompt: systemPrompt(),
            maxTurns: inputs.maxTurns,
            pathToClaudeCodeExecutable: claudePath,
            mcpServers: {
                "cctr-playwright": {
                    command: "bunx",
                    args: ["@playwright/mcp@v0.0.31", "--output-dir", `${inputs.resultsPath}/${testCase.id}/playwright`, "--save-trace"],
                },
                "cctr-state": {
                    type: "http",
                    url: "http://localhost:3001/",
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            },
            allowedTools: [
                // Playwright MCP tools for interacting with the browser
                "mcp__cctr-playwright__browser_close",
                "mcp__cctr-playwright__browser_resize",
                "mcp__cctr-playwright__browser_console_messages",
                "mcp__cctr-playwright__browser_handle_dialog",
                "mcp__cctr-playwright__browser_evaluate",
                "mcp__cctr-playwright__browser_file_upload",
                "mcp__cctr-playwright__browser_install",
                "mcp__cctr-playwright__browser_press_key",
                "mcp__cctr-playwright__browser_type",
                "mcp__cctr-playwright__browser_navigate",
                "mcp__cctr-playwright__browser_navigate_back",
                "mcp__cctr-playwright__browser_navigate_forward",
                "mcp__cctr-playwright__browser_network_requests",
                "mcp__cctr-playwright__browser_snapshot",
                "mcp__cctr-playwright__browser_click",
                "mcp__cctr-playwright__browser_drag",
                "mcp__cctr-playwright__browser_hover",
                "mcp__cctr-playwright__browser_select_option",
                "mcp__cctr-playwright__browser_tab_list",
                "mcp__cctr-playwright__browser_tab_new",
                "mcp__cctr-playwright__browser_tab_select",
                "mcp__cctr-playwright__browser_tab_close",
                "mcp__cctr-playwright__browser_take_screenshot",
                "mcp__cctr-playwright__browser_wait_for",
                // Custom MCP tools for managing the test state
                "mcp__cctr-state__get_test_plan",
                "mcp__cctr-state__update_test_step",
            ],
        },
    });
};
