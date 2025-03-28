import * as fs from 'node:fs';
import { Parser } from 'expr-eval';
import { getJson } from 'serpapi';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import ollama from 'ollama';
import chalk from 'chalk';

const rl = readline.createInterface({ input, output });

const promptTemplate = fs.readFileSync('prompt_template.txt', 'utf-8');
const mergeTemplate = fs.readFileSync('merge_template.txt', 'utf-8');

// Answer question using serpapi google search api
const googleSearch = async (query: string): Promise<string> => {
	try {
		const APIKEY = process.env.SERPAPI_API_KEY as string;
		if (!APIKEY) throw new Error('SerpApi API key not found');
		const googleSearchResponse = await getJson('google_search', {
			q: query,
			api_key: APIKEY,
		});
		// const response = await fetch(
		// 	`https://serpapi.com/search.json?q=${query}&key=${apiKey}`,
		// );
		// const data = await response.json();
		return (
			// different response types from Google can have different structures, so we need to check for each one
			googleSearchResponse.answer_box?.answer ||
			googleSearchResponse.answer_box?.snippet ||
			googleSearchResponse.organic_results?.[0]?.snippet ||
			'No answer found'
		);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(`Error in googleSearch: ${error.message}`);
		} else {
			console.error('Unknown error in googleSearch', error);
		}
		return 'Error in search';
	}
};

// tools for the agent to utilize
interface Tool {
	description: string;
	execute: (input: string) => string | Promise<string>; // Adjust the return type as needed
}

type Tools = { [key: string]: Tool };

const tools: Tools = {
	search: {
		description:
			'a search engine. useful when you need to answer questions about current events, provide information, or help with tasks by searching the internet. input should be a search query', // Searches Google for a given query and returns the answer.',
		execute: googleSearch,
	},
	calculator: {
		description:
			'a calculator. useful when you need to perform mathematical calculations.', // Evaluates a mathematical expression and returns the result.',
		execute: (input: string) => Parser.evaluate(input).toString(),
	},
	// weather: {
	// 	description: 'provides current weather information for a given location.', // Fetches current weather data from an API and returns it.
	// 	execute: async (location: string) => {
	// 		const apiKey = 'YOUR_API_KEY'; // Replace with your actual API key
	// 		const response = await fetch(
	// 			`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`,
	// 		);
	// 		const data = await response.json();
	// 		return `Current weather in ${data.name}: ${data.weather[0].description}, temperature: ${data.main.temp}K`;
	// 	},
	// Add more tools as needed
};

//  use ollama with //TODO choose model to complete a given prompt
const completePrompt = async (prompt: string) => {
	const selectedModel = 'llama3.1:8b';

	try {
		const { response } = await ollama.generate({
			format: 'json',
			model: selectedModel,
			options: {
				stop: ['Observations:'],
				temperature: 0.7, // Adjust as needed higher for creativity vs. lower for accuracy
			},
			prompt,
			stream: false,
		});
		console.log('🚀 ~ completePrompt ~ prompt:', chalk.red(prompt));
		console.log('🚀 ~ completePrompt ~ response:', chalk.green(response));
		console.log('🚀 ~ completePrompt ~ response:', chalk.green(response));
		return response;
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(chalk.red(`Error in completePrompt: ${error.message}`));
		} else {
			console.error(chalk.red(`Unknown error in completePrompt: ${error}`));
		}
		throw new Error('Error in completePrompt: Unknown error occurred.');
	}
};

const answerQuestion = async (question: string) => {
	// construct the prompt with the question and tools that the agentic chain can use
	let prompt = promptTemplate.replace('${question}', question).replace(
		'${tools}',
		Object.keys(tools)
			.map((toolName) => `${toolName}: ${tools[toolName].description}`)
			.join('\n'),
	);
	// TODO: Add iteration loop for multiple attempts to complete answer

	while (true) {
		try {
			const response = await completePrompt(prompt);
			//  add response to existing prompt
			prompt += response;

			const action = response.match(/Action: (.+)/)?.[1];
			if (action) {
				// execute action based on the response of LLM
				const actionMatch = response.match(/Action Input: "?(.*)"?/);
				if (actionMatch && actionMatch[1]) {
					const actionInput = actionMatch[1];
					const result = await tools[action.trim()].execute(actionInput);
					prompt += `Observation: ${result}\n`;
				} else {
					throw new Error('No action input provided');
				}
			} else {
				// continue with the loop if there is no action
				return response.match(/Final Answer: (.*)/)?.[1];
			}
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error(chalk.red(`Error in answerQuestion: ${error.message}`));
			} else {
				console.error(chalk.red(`Unknown error in answerQuestion: ${error}`));
			}
			throw new Error('Error in answerQuestion: Unknown error occurred.');
		}
	}
};

const mergeHistory = async (question: string, history: string) => {
	const prompt = mergeTemplate
		.replace('${question}', question)
		.replace('${history}', history);
	return await completePrompt(prompt);
};

// Function to handle user input and execute the appropriate tool
let history = '';
while (true) {
	let question = await rl.question('How can I assist you? ');
	if (history.length > 0) {
		question = await mergeHistory(question, history);
	}
	const answer = await answerQuestion(question);
	console.log('🚀 ~ answer:', chalk.blueBright(answer));
	history += `Q: ${question}\nA: ${answer}\n`;
}
