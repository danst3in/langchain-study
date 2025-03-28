import * as fs from 'node:fs';
import { Parser } from 'expr-eval';
import { getJson } from 'serpapi';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

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
