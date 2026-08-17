# AI Workflow Audit

## Feature
Transaction Form Validation

## Round 1

### Prompt
Review this React project and add proper validation to the Add Transaction form.

Requirements:
- Title is required.
- Amount must be greater than 0.
- Show clear error messages below invalid fields.
- Prevent form submission if validation fails.
- Keep the existing UI and functionality unchanged.

### Result
- Added basic validation.
- Displayed error messages.
- Prevented invalid submissions.
- Preserved the existing UI.

---

## Round 2

### Prompt
Review the AddTransactionForm component and improve it using production-quality React practices.

Requirements:
- Keep all existing validation.
- Trim whitespace before validation.
- Disable the submit button while the form is invalid.
- Show character limit feedback for the title (maximum 50 characters).
- Prevent duplicate submissions.
- Improve accessibility by adding appropriate aria-invalid and aria-describedby attributes.
- Do not change the visual design unless necessary.
- Explain every improvement you make.

### Result
- Centralized validation using React hooks.
- Added whitespace trimming.
- Disabled submit button for invalid input.
- Added character counter.
- Prevented duplicate submissions.
- Improved accessibility with ARIA attributes.
- Improved maintainability using useMemo and useCallback.

---

## Comparison

Round 2 produced cleaner, more maintainable, and production-ready code. The detailed prompt resulted in better validation logic, improved accessibility, and a more robust user experience compared to the simpler prompt used in Round 1.

## Learning

I learned that giving detailed prompts with clear requirements, constraints, and accessibility expectations leads to significantly higher-quality AI-generated code than using a simple prompt.