# Magna Labs Technical Assessment — Requirements Summary

## Challenge Overview

Build a production-ready SaaS web application called **AI Content Marketing Suite**.

The application should help marketers create, manage, and optimize marketing content using AI. It must feel like a real product, with a clean user interface, solid backend APIs, data persistence, and intelligent AI-powered features.

## Time Limit

* The challenge must be completed within **48 hours**.
* The countdown starts when the candidate first logs into the challenge portal.
* The timer does not reset.

## Submission Requirements

The final submission must include:

1. **Live App URL**

   * The application must be deployed and publicly accessible.
   * It can be deployed on Vercel, Railway, Render, or a similar platform.
   * The deployed app must remain live for at least **7 days** after submission.

2. **Video Walkthrough**

   * A screen recording between **5 and 10 minutes**.
   * The video must show the product working end-to-end.
   * It must include:

     * Text generation flow.
     * Image generation flow.
     * A portion of the Claude Code workflow.

3. **GitHub Repository**

   * Public GitHub repository.
   * Clean README.
   * README should include:

     * Setup steps.
     * Tech stack.
     * API documentation.
     * Brief architecture decisions.

4. **Optional Architecture Note**

   * A short document, maximum 1 page.
   * Should explain:

     * Design choices.
     * Trade-offs.
     * What would be built next with more time.

---

# Product Requirements

## 1. AI Content Generator

Users should be able to generate polished marketing content using an LLM.

### User Inputs

The user must provide:

* Topic.
* Tone.
* Target audience.
* Content type.

### Supported Content Types

The app must support at least **3 content types** from the following:

* Blog post.
* LinkedIn post.
* Ad copy.
* Email.

Each content type must have a **distinct prompt strategy**. Do not use the exact same generic prompt for all content types.

### Expected Behavior

The LLM should return polished, ready-to-use marketing content based on the user inputs.

The generated content should be relevant, coherent, well-structured, and appropriate for the selected content type.

---

## 2. AI Image Generator Per Post

Each generated post should support matching AI image generation.

### Required Flow

After content is generated:

1. The user clicks a button to generate a matching image.
2. The backend automatically builds a visual prompt based on:

   * Content topic.
   * Tone.
   * Generated content.
   * Content type.
3. The app calls an image generation API.
4. The generated image is displayed alongside the text content.
5. The user can regenerate the image with a different style.

### Supported Image API

Any image generation API can be used, such as:

* DALL-E 3.
* Stability AI.
* Replicate.
* Any similar image generation service.

### Important Requirement

Image API calls must happen server-side. The frontend must not directly call the image provider.

---

## 3. Content History & Dashboard

The application must save generated content and images.

### Required Features

Users should be able to:

* View past generations.
* View generated text and its matching image.
* Copy content.
* Download content.
* Delete past generations.

### Dashboard Requirements

The dashboard should be:

* Clean.
* Fast.
* Paginated.
* Easy to use.

Each history item should show:

* Generated text.
* Matching generated image.
* Relevant metadata such as content type, topic, tone, and creation date.

---

## 4. AI Content Improver

Users should be able to paste existing text and improve it using AI.

### User Inputs

The user should provide:

* Existing text.
* Improvement goal.

### Supported Improvement Goals

The app should support goals such as:

* Make it shorter.
* Make it more persuasive.
* Make it more formal.
* SEO-optimize it.
* Rewrite it for a different audience.

### Expected Output

The LLM should return:

* The refined/improved version.
* A short explanation of what changed.

---

## 5. REST API Backend

All major features must be powered by clean REST API endpoints.

### Required Backend Responsibilities

The backend must handle:

* Text generation.
* Image generation.
* Content storage.
* Content retrieval.
* Content deletion.
* Content improvement.

### Important Security Rule

The frontend must not directly call the LLM API or image generation API.

All AI logic must run server-side through backend API endpoints.

### README Requirement

All API endpoints must be documented in the README.

The documentation should include:

* HTTP method.
* Endpoint path.
* Purpose.
* Request body example where relevant.
* Response example where relevant.

---

## 6. Claude Code Workflow

Claude Code should be used as the primary development tool during the build.

The video walkthrough must clearly show Claude Code usage, such as:

* Architecture planning.
* Debugging sessions.
* Refactoring.
* Prompt-driven code generation.
* Improving implementation quality.

This is part of the scoring, so it must be shown clearly in the final walkthrough video.

---

# Scoring Criteria

The assessment is scored as follows:

## 25 Points — LLM & Prompt Quality

Evaluation focus:

* Output quality.
* Prompt strategy per content type.
* Relevance.
* Coherence.
* Quality of generated marketing content.

## 20 Points — AI Image Generation

Evaluation focus:

* Quality of automatically generated image prompts.
* Relevance of image to the generated content.
* Smoothness of the image generation user experience.
* Ability to regenerate with different styles.

## 20 Points — Backend & API Design

Evaluation focus:

* Backend structure.
* Clean REST API design.
* Error handling.
* Security.
* README API documentation.
* Server-side AI logic.

## 15 Points — Frontend & UI/UX

Evaluation focus:

* Usability.
* Design quality.
* Responsiveness.
* Text and image layout.
* Overall product feel.

## 15 Points — Claude Code Usage

Evaluation focus:

* Clear demonstration of Claude Code workflow.
* Architecture planning.
* Debugging.
* Refactoring.
* AI-native development process.

## Bonus — Up to 10 Points

Possible bonus features:

* Brand voice settings.
* Image style picker.
* Export to PDF or document.

---

# Rules

The following rules apply:

* Any LLM API may be used.
* Any image generation API may be used.
* Any framework or database may be used.
* AI coding assistants are encouraged, including Claude Code, Cursor, and GitHub Copilot.
* The video must clearly show text generation and image generation working end-to-end.
* Third-party UI component libraries are allowed.
* Starting from a full boilerplate template is not allowed.
* The deployed URL must remain accessible for at least 7 days after submission.
* The 48-hour timer starts on first login and does not reset.
* The assessment must be completed solo.
* No team submissions are allowed.

---

# Expected Final Product

The final product should be a polished SaaS-style web application where a user can:

1. Log in.
2. Generate marketing content using AI.
3. Generate a matching AI image for the content.
4. Regenerate the image using a different style.
5. Save generated content and image history.
6. View previous generations in a dashboard.
7. Copy, download, and delete generated content.
8. Improve existing text using AI.
9. Use a clean, responsive, high-quality interface.
10. Access all AI functionality through secure server-side REST APIs.

---

# Recommended Interpretation

The task is not only about calling an AI API. The product should demonstrate:

* Strong full-stack engineering.
* Good AI product UX.
* Clean API design.
* Thoughtful prompt engineering.
* Good data persistence.
* Professional UI/UX.
* Ability to ship a complete deployed product under time constraints.
* Effective use of Claude Code during development.

