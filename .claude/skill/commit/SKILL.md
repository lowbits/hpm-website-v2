# Commit Skill

Use this skill when committing changes to ensure related GitHub issues are properly referenced and closed.

## Trigger

Activate when the user mentions:
- Committing changes
- "commit", "save", "done with this issue"
- Finishing work on a GitHub issue

## Workflow

### Step 1: Identify Related Issues

Before committing, check if the current work relates to any open GitHub issues:

1. Review the changes being committed (`git diff --staged`)
2. Check the conversation context for issue references (e.g., `#123`)
3. If no issue was explicitly mentioned, search for matching open issues:
   ```bash
   gh issue list --repo lowbits/hpm-website-v2 --state open --json number,title --limit 50
   ```
4. Ask the user which issue(s) this commit relates to if unclear

### Step 2: Compose the Commit Message

Structure the commit message with issue references:

```
<type>: <short description>

<optional body with details>

Fixes #N
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

**Commit types:**
- `feat` — New feature or component
- `fix` — Bug fix
- `chore` — Config, cleanup, dependencies
- `style` — CSS/styling changes only
- `refactor` — Code restructure without behavior change
- `content` — Content type or field changes

**Issue keywords:**
- `Fixes #N` — Closes the issue automatically when merged to default branch
- `Closes #N` — Same as Fixes
- `Relates to #N` — References without closing (use when partially addressing an issue)

### Step 3: Commit

```bash
git commit -m "$(cat <<'EOF'
feat: Add quotes slider component

Implements the quotes carousel with auto-cycling theme colors
and Splide integration.

Fixes #42
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

### Step 4: Verify Issue Status

After committing (and pushing if applicable), verify the issue reference:

```bash
# If pushed and merged, check the issue was closed
gh issue view N --repo lowbits/hpm-website-v2 --json state -q '.state'
```

If the commit won't be merged immediately (e.g., working on a branch), add a comment to the issue noting progress:

```bash
gh issue comment N --repo lowbits/hpm-website-v2 --body "Addressed in commit $(git rev-parse --short HEAD) on branch $(git branch --show-current)"
```

## Multiple Issues

When a single commit addresses multiple issues, list them all:

```
Fixes #12
Fixes #15
Relates to #8
```

## Partial Work

If the commit only partially addresses an issue:
- Use `Relates to #N` instead of `Fixes #N`
- Do NOT close the issue
- Add a comment to the issue describing what was done and what remains