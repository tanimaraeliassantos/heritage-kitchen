export interface ScrapedRecipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  image?: string;
}

/**
 * Mock recipe scraper - simulates extracting recipe data from a URL.
 * In production, this would use an edge function to fetch and parse the page.
 */
export async function scrapeRecipeFromUrl(url: string): Promise<ScrapedRecipe> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Validate URL
  try {
    new URL(url);
  } catch {
    throw new Error('Please enter a valid URL.');
  }

  // Return mock data based on URL patterns for demo
  if (url.includes('allrecipes') || url.includes('recipe')) {
    return {
      title: 'Imported Recipe',
      ingredients: [
        '2 cups all-purpose flour',
        '1 tsp baking soda',
        '1/2 tsp salt',
        '1 cup butter, softened',
        '3/4 cup sugar',
      ],
      instructions: [
        'Preheat oven to 375°F (190°C).',
        'Mix dry ingredients in a bowl.',
        'Cream butter and sugar until fluffy.',
        'Combine wet and dry ingredients.',
        'Bake for 12 minutes or until golden.',
      ],
    };
  }

  return {
    title: 'Imported Recipe from ' + new URL(url).hostname,
    ingredients: ['Paste your ingredients here'],
    instructions: ['Paste your instructions here'],
  };
}
