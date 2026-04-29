---
name: verify-ticket
description: Step-by-step verification of a completed GitHub issue. Use after implementing a ticket to verify it works correctly before closing. Trigger on "verify ticket", "test ticket", "check issue", or after completing implementation work.
risk: low
source: custom
---

# Verify Ticket

Systematic verification workflow for completed GitHub issues on the HPM Drupal website.

## When to Use

- After implementing a GitHub issue, before marking it as done
- When the user asks to verify/test a completed ticket
- As part of the issue workflow: implement -> verify -> push -> close -> inform client

## Workflow

### Step 1: Gather Context

1. Fetch the GitHub issue details:
   ```bash
   gh issue view <NUMBER> --json title,body,labels
   ```
2. Read the issue description carefully — identify the **acceptance criteria** (what the client expects to see)
3. Identify the type: bug fix, config change, frontend change, new feature, backend/admin change

### Step 2: Code Verification

1. Check the relevant commit(s):
   ```bash
   git log --oneline --all --grep="#<NUMBER>"
   ```
2. Review the changed files to confirm completeness:
   ```bash
   git show <COMMIT> --stat
   ```
3. Read the key changed files to verify correctness

### Step 3: Config Verification (if config was exported)

1. Run the Config Export Checklist from CLAUDE.md:
   - Verify `profile: minimal` in `config/sync/core.extension.yml`
   - Verify `minimal: 1000` in module list
   - Verify `standard` is NOT in module list
2. Check for placeholder/fake UUIDs in any new config files

### Step 4: Frontend Verification (if templates/CSS/JS changed)

1. Confirm template files exist and have correct Twig syntax
2. If CSS was changed, verify Tailwind build would succeed:
   ```bash
   cd web/themes/custom/hpm && npx @tailwindcss/cli -i css/src/tailwind.css -o css/dist/style.css --dry-run 2>&1 || true
   ```
3. If JS was changed, verify source files in `js/src/` match what's in `js/dist/`

### Step 5: Drupal Verification (via MCP or Drush)

For admin/config changes, use the Drupal MCP tools to verify:
- Content type fields: use `mcp_tools_list_content_types` or check config YAML
- Views/displays: check the relevant config YAML files
- Permissions: use `mcp_tools_get_permissions`
- Menu structure: use `mcp_tools_get_menu_tree`

### Step 6: Generate Test Checklist

Output a **client-facing test checklist** in German, formatted as:

```
## Ticket #<NUMBER>: <Title>

### Testschritte:
1. [ ] <Step 1 — what to do and where>
2. [ ] <Step 2 — what to check>
3. [ ] <Step 3 — expected result>

### Erwartetes Ergebnis:
<Clear description of what should be visible/functional>
```

### Step 7: Post to GitHub Issue

Post the verification steps as a **comment on the GitHub issue** so the client can see them:

```bash
gh issue comment <NUMBER> --body "$(cat <<'EOF'
## Umsetzung

<Brief description of what was changed and why, in German>

## Testschritte

1. [ ] <Step 1>
2. [ ] <Step 2>
3. [ ] <Step 3>

### Erwartetes Ergebnis
<Expected result in German>
EOF
)"
```

### Step 8: Assign for Review

Do NOT close the issue. Assign it to the client/reviewer for testing:

```bash
gh issue edit <NUMBER> --add-label "ready for review"
```

The client reviews, tests using the checklist, and closes the issue themselves.

### Step 9: Report to User

Summarize:
- What was changed (files, config, templates)
- Verification status (pass/fail with details)
- Link to the GitHub comment
- Any remaining concerns or follow-ups