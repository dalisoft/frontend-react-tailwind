# MCP Servers and configurations

It is better to configure local MCP to avoid conflicts and collision of MCP servers between projects so all of your project can work isolated and could run in containers easily

## Directories

| AI Agent                                                                       | Local config                                        | Global config                 |
| ------------------------------------------------------------------------------ | --------------------------------------------------- | ----------------------------- |
| [Claude Code](https://code.claude.com/docs/en/mcp)                             | [`.mcp.json`](../.mcp.json)                         | `~/.claude.json`              |
| [Kilo Code](https://kilo.ai/docs/features/mcp/using-mcp-in-kilo-code)          | [`.kilocode/mcp.json`](../.kilocode/mcp.json)       |                               |
| [Roo Code](https://docs.roocode.com/features/mcp/using-mcp-in-roo)             | [`.roo/mcp.json`](../.roo/mcp.json)                 |                               |
| [VSCode](https://code.visualstudio.com/docs/copilot/customization/mcp-servers) | [`.vscode/mcp.json`](../.vscode/mcp.json)           |                               |
| [Cursor](https://cursor.com/docs/context/mcp)                                  | [`.cursor/mcp.json`](../.cursor/mcp.json)           | `~/.cursor/mcp.json`          |
| [Zed](https://zed.dev/docs/ai/mcp)                                             | [`.zed/settings.json`](../.zed/settings.json)       | `~/.config/zed/settings.json` |
| [Factory Droid](https://docs.factory.ai/cli/configuration/mcp)                 | [`.factory/mcp.json`](../.factory/mcp.json)         | `~/.factory/mcp.json`         |
| [Gemini](https://geminicli.com/docs/tools/mcp-server)                          | [`.gemini/settings.json`](../.gemini/settings.json) | `~/.gemini/settings.json`     |

## Global MCP

Set as you wish

## Local MCP

Configure per-project workflow based MCP servers
