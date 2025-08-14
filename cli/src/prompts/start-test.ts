import { which } from "bun";
import { systemPrompt } from "./system";
import { query } from "@anthropic-ai/claude-code";
import { inputs } from "../utils/args";

/**
 * Initiates a Claude Code query to start a test execution.
 * @returns The Claude Code query.
 * @throws {Error} If Claude is not found on path.
 */
export const startTest = () => {
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
                playwright: {
                    command: "bunx",
                    args: ["@playwright/mcp@v0.0.31"],
                },
                testState: {
                    type: "http",
                    url: "http://localhost:3001/",
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            },
            allowedTools: [
                // Playwright MCP tools for interacting with the browser
                "mcp__playwright__browser_close",
                "mcp__playwright__browser_resize",
                "mcp__playwright__browser_console_messages",
                "mcp__playwright__browser_handle_dialog",
                "mcp__playwright__browser_evaluate",
                "mcp__playwright__browser_file_upload",
                "mcp__playwright__browser_install",
                "mcp__playwright__browser_press_key",
                "mcp__playwright__browser_type",
                "mcp__playwright__browser_navigate",
                "mcp__playwright__browser_navigate_back",
                "mcp__playwright__browser_navigate_forward",
                "mcp__playwright__browser_network_requests",
                "mcp__playwright__browser_snapshot",
                "mcp__playwright__browser_click",
                "mcp__playwright__browser_drag",
                "mcp__playwright__browser_hover",
                "mcp__playwright__browser_select_option",
                "mcp__playwright__browser_tab_list",
                "mcp__playwright__browser_tab_new",
                "mcp__playwright__browser_tab_select",
                "mcp__playwright__browser_tab_close",
                "mcp__playwright__browser_wait_for",
                // Custom MCP tools for managing the test state
                "mcp__testState__get_test_plan",
                "mcp__testState__update_test_step",
            ],
        },
    });
};
