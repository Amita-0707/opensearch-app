const { client } = require('../config/opensearch');

exports.searchItems = async (req, res, next) => {
  try {
    const { q, category, minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;
    const from = (page - 1) * limit;

    // Core execution pipeline setup
    let query = {
      bool: {
        must: [
          { term: { userId: req.user.id } } // Isolate data by the authenticated user
        ],
        filter: []
      }
    };

    // Multi-Match Text, Fuzzy Matching & Autocomplete Resolution
    if (q) {
      query.bool.must.push({
        bool: {
          should: [
            {
              multi_match: {
                query: q,
                fields: ['title^3', 'description'],
                fuzziness: 'AUTO'
              }
            },
            {
              match: {
                'title.autocomplete': q
              }
            }
          ]
        }
      });
    }

    // Apply Filters (Category, Price Ranges)
    if (category) {
      query.bool.filter.push({ term: { category } });
    }
    if (minPrice || maxPrice) {
      let range = { price: {} };
      if (minPrice) range.price.gte = parseFloat(minPrice);
      if (maxPrice) range.price.lte = parseFloat(maxPrice);
      query.bool.filter.push({ range });
    }

    // Apply Sorting Rules
    let sortSchema = [{ _score: 'desc' }];
    if (sort) {
      const [field, order] = sort.split(':');
      sortSchema = [{ [field]: order }];
    }

    const { body } = await client.search({
      index: 'items',
      body: {
        query,
        sort: sortSchema,
        from,
        size: parseInt(limit),
        highlight: {
          fields: {
            title: {},
            description: {}
          },
          pre_tags: ['<mark>'],
          post_tags: ['</mark>']
        }
      }
    });

    const results = body.hits.hits.map(hit => ({
      ...hit._source,
      highlight: hit.highlight || {},
      score: hit._score
    }));

    res.json({
      total: body.hits.total.value,
      page: parseInt(page),
      pages: Math.ceil(body.hits.total.value / limit),
      results
    });
  } catch (error) { next(error); }
};