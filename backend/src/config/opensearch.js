const { Client } = require('@opensearch-project/opensearch');
const logger = require('../utils/logger');

const client = new Client({
  node: process.env.OPENSEARCH_NODE || 'http://localhost:9200',
  ssl: { rejectUnauthorized: false } // Essential for development & internal AWS VPC setups
});

const initOpenSearch = async () => {
  const indexName = 'items';
  try {
    const { body: exists } = await client.indices.exists({ index: indexName });
    if (!exists) {
      await client.indices.create({
        index: indexName,
        body: {
          settings: {
            analysis: {
              analyzer: {
                autocomplete_analyzer: {
                  type: 'custom',
                  tokenizer: 'edge_ngram_tokenizer',
                  filter: ['lowercase']
                }
              },
              tokenizer: {
                edge_ngram_tokenizer: {
                  type: 'edge_ngram',
                  min_gram: 2,
                  max_gram: 20,
                  token_chars: ['letter', 'digit']
                }
              }
            }
          },
          mappings: {
            properties: {
              id: { type: 'keyword' },
              title: { 
                type: 'text', 
                fields: { autocomplete: { type: 'text', analyzer: 'autocomplete_analyzer' } } 
              },
              description: { type: 'text' },
              category: { type: 'keyword' },
              price: { type: 'float' },
              userId: { type: 'keyword' }
            }
          }
        }
      });
      logger.info(`OpenSearch structural template index '${indexName}' generated.`);
    }
  } catch (error) {
    logger.error('Error establishing OpenSearch mapping layout:', error);
  }
};

module.exports = { client, initOpenSearch };