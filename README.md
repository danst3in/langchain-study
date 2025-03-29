# LangChain-Study

A simplified re-implementation of LangChain in ~200 lines of TypeScript. This is a study project to understand the LangChain framework and its components.
The goal is to create a minimalistic version of LangChain that retains the core functionality while being easy to understand and modify.

This work is based on the blog post [Re-implementing LangChain in 100 lines of code](https://blog.scottlogic.com/2023/05/04/langchain-mini.html) by [Colin Eberhardt](https://blog.scottlogic.com/ceberhardt/).

This project uses the following libraries:

- **SerpAPI**: For web search.
- **OllamaJS**: For interacting with an LLM.

## Features

- Chainable calls to an LLM for reasoning and tool invocation (currently includes search and calculator tools).
- Conversational interface that retains context across multiple questions.
- Uses TypeScript for a more robust codebase.

## Differences from Original Implementation

### Language

- The original implementation was in JavaScript. This version is written in TypeScript, providing better type safety and maintainability.

### Libraries

- **SerpAPI** is used instead of the `fetch` API to perform web searches and provide type definitions.
- **OllamaJS** is used for interacting with an LLM, replacing the OpenAI API calls and allowing testing with different local models.

## Setup

### Prerequisites

- Node.js (v22 or later)
- Ollama installed and running locally. You can install it from [Ollama's website](https://ollama.com/).
- An API key for SerpAPI. You can sign up for a free account at [SerpAPI](https://serpapi.com/).

### Steps to Run the Project

1. **Clone the repository:**
    ```bash
    git clone git@github.com:danst3in/langchain-study.git
    cd langchain-study
    ```
2. **Install dependencies:**
    ```bash
    npm install
    ```
3. **Start the application:**
    ```bash
    npm start
    ```
    or alternatively, if you want to run in watch mode while adjusting the prompt template or selected ollama model:
    ```bash
    npm run dev
    ```
