# GitHub Issues Skill

Use this skill to fetch, prioritize, and plan work on GitHub issues created by editors for the HPM website project.

## Trigger

Activate when the user mentions:
- Reviewing or listing GitHub issues
- Prioritizing issues / planning a sprint
- "issues", "backlog", "what's next", "plan work"
- Asking what to work on next

## Repository

`lowbits/hpm-website-v2`

## Workflow

### Step 1: Fetch Open Issues

Fetch all open issues with labels, assignees, and metadata:

```bash
gh issue list --repo lowbits/hpm-website-v2 --state open --json number,title,body,labels,assignee,createdAt,updatedAt,milestone,comments --limit 100
```

### Step 2: Categorize & Prioritize

Classify each issue into one of these categories based on its content:

| Priority | Category | Description |
|----------|----------|-------------|
| P0 | Bug (critical) | Broken functionality, site errors, data loss |
| P1 | Bug (minor) | Visual glitches, non-blocking issues |
| P2 | Content/Component | New component, content type change, field addition |
| P3 | Enhancement | Improvement to existing feature, UX refinement |
| P4 | Chore | Config cleanup, tech debt, documentation |

When prioritizing, consider:
- **Impact:** How many pages/users does this affect?
- **Dependency:** Does this block other issues?
- **Complexity:** Estimate effort (small / medium / large)
- **Component alignment:** Does it relate to a component from the spec (`260125-hpm-components.numbers`)?

### Step 3: Group by Theme

Group related issues together to batch work efficiently:
- Component work (paragraph types, templates)
- Content type / field changes (Drupal config)
- Styling / CSS fixes
- JavaScript / interaction bugs
- Infrastructure / config

### Step 4: Present the Plan

Present the prioritized backlog as a structured plan:

```
## Prioritized Issue Backlog

### P0 — Critical (do first)
- #123 — Issue title [component: alternate] (small)

### P1 — Bugs
- #456 — Issue title [styling] (medium)

### P2 — Components & Content
- #789 — Issue title [component: new] (large)
- #790 — Issue title [component: quotes] (small)

### P3 — Enhancements
- #101 — Issue title [ux] (medium)

### P4 — Chores
- #102 — Issue title [config] (small)

## Suggested Work Order
1. [ ] #123 — reason (blocks X)
2. [ ] #456 — reason (quick win)
3. [ ] #789, #790 — reason (batch component work)
...
```

### Step 5: Work on Issues

When the user selects an issue to work on:

1. Fetch the full issue details: `gh issue list --repo lowbits/hpm-website-v2 --state open --json number,title,body,labels,comments -q '.[] | select(.number == N)'`
2. Cross-reference with the component spec if it involves a component (use the `drupal-components` skill)
3. Create a task list tracking the implementation steps
4. After completing work, reference the issue in the commit message: `Fixes #N` or `Relates to #N`

## Labels Reference

Use labels to understand issue intent. Common patterns:
- **bug** — Something broken
- **enhancement** — Improvement request
- **component** — Related to a specific HPM component
- **content** — Content structure or editorial change
- **styling** — CSS / visual issue
- **urgent** — Editor-flagged priority

## Useful Commands

```bash
# List all open issues
gh issue list --repo lowbits/hpm-website-v2 --state open

# View a specific issue
gh issue view N --repo lowbits/hpm-website-v2

# List issues by label
gh issue list --repo lowbits/hpm-website-v2 --label "bug"

# List issues with full body text
gh issue list --repo lowbits/hpm-website-v2 --state open --json number,title,body

# Add a comment to an issue
gh issue comment N --repo lowbits/hpm-website-v2 --body "Working on this"

# Close an issue
gh issue close N --repo lowbits/hpm-website-v2
```

## Integration with Component Skill

When an issue references a component (e.g., "fix the quotes slider", "add accordion to alternate"):
1. Look up the component in the `drupal-components` skill spec
2. Check the template source at `~/git/hpm-website-template/src/twig/components/`
3. Check the Drupal template at `web/themes/custom/hpm/templates/paragraph/`
4. Ensure changes align with both the spec and the template