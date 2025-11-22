use crate::activity::ActivityType;
use crate::profile::InterestCategory;
use rand::Rng;
use rand::seq::SliceRandom;

/// Generates realistic URLs and titles based on interests and activity types
pub struct InterestUrlGenerator {
    domains: DomainDatabase,
}

impl InterestUrlGenerator {
    pub fn new() -> Self {
        Self {
            domains: DomainDatabase::new(),
        }
    }

    pub fn generate_url<R: Rng>(
        &self,
        activity_type: &ActivityType,
        interest: &Option<InterestCategory>,
        rng: &mut R,
    ) -> (String, String) {
        match activity_type {
            ActivityType::Search => self.generate_search_url(interest, rng),
            ActivityType::VideoWatch => self.generate_video_url(interest, rng),
            ActivityType::Shopping => self.generate_shopping_url(interest, rng),
            ActivityType::SocialMedia => self.generate_social_url(rng),
            ActivityType::News => self.generate_news_url(interest, rng),
            ActivityType::Research => self.generate_research_url(interest, rng),
            ActivityType::PageVisit => self.generate_page_url(interest, rng),
        }
    }

    fn generate_search_url<R: Rng>(
        &self,
        interest: &Option<InterestCategory>,
        rng: &mut R,
    ) -> (String, String) {
        let query = self.get_search_query(interest, rng);
        let encoded_query = query.replace(" ", "+");

        let search_engine = ["google.com", "bing.com", "duckduckgo.com"]
            .choose(rng)
            .unwrap();

        let url = format!("https://{}/search?q={}", search_engine, encoded_query);
        let title = format!("{} - Search", query);

        (url, title)
    }

    fn generate_video_url<R: Rng>(
        &self,
        interest: &Option<InterestCategory>,
        rng: &mut R,
    ) -> (String, String) {
        let title = self.get_video_title(interest, rng);
        let video_id = self.generate_video_id(rng);

        let platform = ["youtube.com", "vimeo.com"].choose(rng).unwrap();
        let url = if *platform == "youtube.com" {
            format!("https://www.youtube.com/watch?v={}", video_id)
        } else {
            format!("https://vimeo.com/{}", rng.gen_range(100000000..999999999))
        };

        (url, title)
    }

    fn generate_shopping_url<R: Rng>(
        &self,
        interest: &Option<InterestCategory>,
        rng: &mut R,
    ) -> (String, String) {
        let product = self.get_product_name(interest, rng);
        let domain = self.domains.get_shopping_domain(rng);

        let url = format!(
            "https://{}/products/{}",
            domain,
            product.to_lowercase().replace(" ", "-")
        );
        let title = format!("{} - {}", product, domain.split('.').next().unwrap());

        (url, title)
    }

    fn generate_social_url<R: Rng>(&self, rng: &mut R) -> (String, String) {
        let platforms = vec![
            ("twitter.com", "Twitter"),
            ("reddit.com", "Reddit"),
            ("facebook.com", "Facebook"),
            ("instagram.com", "Instagram"),
            ("linkedin.com", "LinkedIn"),
        ];

        let (domain, name) = platforms.choose(rng).unwrap();
        let url = format!("https://{}", domain);
        let title = format!("Home - {}", name);

        (url, title)
    }

    fn generate_news_url<R: Rng>(
        &self,
        interest: &Option<InterestCategory>,
        rng: &mut R,
    ) -> (String, String) {
        let domain = self.domains.get_news_domain(rng);
        let headline = self.get_news_headline(interest, rng);

        let slug = headline
            .to_lowercase()
            .chars()
            .map(|c| if c.is_alphanumeric() || c == ' ' { c } else { ' ' })
            .collect::<String>()
            .split_whitespace()
            .take(8)
            .collect::<Vec<_>>()
            .join("-");

        let url = format!("https://{}/article/{}", domain, slug);
        let title = format!("{} - {}", headline, domain.split('.').next().unwrap());

        (url, title)
    }

    fn generate_research_url<R: Rng>(
        &self,
        interest: &Option<InterestCategory>,
        rng: &mut R,
    ) -> (String, String) {
        let domain = self.domains.get_research_domain(rng);
        let topic = self.get_research_topic(interest, rng);

        let url = if domain.contains("wikipedia") {
            format!("https://{}/wiki/{}", domain, topic.replace(" ", "_"))
        } else {
            format!("https://{}/article/{}", domain, topic.to_lowercase().replace(" ", "-"))
        };

        let title = format!("{} - {}", topic, domain.split('.').next().unwrap());

        (url, title)
    }

    fn generate_page_url<R: Rng>(
        &self,
        interest: &Option<InterestCategory>,
        rng: &mut R,
    ) -> (String, String) {
        let domain = self.domains.get_interest_domain(interest, rng);
        let page = self.get_page_title(interest, rng);

        let url = format!(
            "https://{}/{}",
            domain,
            page.to_lowercase().replace(" ", "-")
        );
        let title = format!("{} | {}", page, domain.split('.').next().unwrap());

        (url, title)
    }

    fn get_search_query<R: Rng>(&self, interest: &Option<InterestCategory>, rng: &mut R) -> String {
        if let Some(cat) = interest {
            let queries = match cat {
                InterestCategory::Technology => vec!["latest smartphones", "cloud computing trends", "AI news", "tech reviews"],
                InterestCategory::Gaming => vec!["best games 2024", "gaming benchmarks", "esports tournament", "game reviews"],
                InterestCategory::Sports => vec!["football scores", "NBA highlights", "soccer news", "sports statistics"],
                InterestCategory::Cooking => vec!["easy recipes", "meal prep ideas", "cooking techniques", "healthy meals"],
                InterestCategory::Travel => vec!["travel destinations", "cheap flights", "hotel reviews", "travel tips"],
                InterestCategory::Finance => vec!["stock market news", "investment strategies", "crypto prices", "financial planning"],
                InterestCategory::Programming => vec!["rust tutorial", "typescript best practices", "algorithm examples", "code review"],
                _ => vec!["latest news", "trending topics", "popular articles", "how to"],
            };
            queries.choose(rng).unwrap().to_string()
        } else {
            vec!["news", "weather", "recipes", "reviews"]
                .choose(rng)
                .unwrap()
                .to_string()
        }
    }

    fn get_video_title<R: Rng>(&self, interest: &Option<InterestCategory>, rng: &mut R) -> String {
        if let Some(cat) = interest {
            let titles = match cat {
                InterestCategory::Technology => vec!["Tech Review: Latest Gadgets", "Programming Tutorial", "Tech News Weekly"],
                InterestCategory::Gaming => vec!["Gameplay Walkthrough", "Gaming News", "Top 10 Games"],
                InterestCategory::Cooking => vec!["Quick Recipe Tutorial", "Cooking Tips", "Chef's Special"],
                InterestCategory::Music => vec!["Official Music Video", "Live Performance", "Music Review"],
                InterestCategory::Fitness => vec!["Workout Routine", "Fitness Tips", "Exercise Guide"],
                _ => vec!["Popular Video", "Trending Content", "Featured Video"],
            };
            titles.choose(rng).unwrap().to_string()
        } else {
            "Trending Video".to_string()
        }
    }

    fn get_product_name<R: Rng>(&self, interest: &Option<InterestCategory>, rng: &mut R) -> String {
        if let Some(cat) = interest {
            let products = match cat {
                InterestCategory::Technology => vec!["Wireless Headphones", "Smart Watch", "Laptop Stand", "USB Cable"],
                InterestCategory::Gaming => vec!["Gaming Mouse", "Mechanical Keyboard", "Gaming Chair", "Headset"],
                InterestCategory::Fitness => vec!["Yoga Mat", "Resistance Bands", "Water Bottle", "Protein Powder"],
                InterestCategory::Cooking => vec!["Chef Knife", "Cutting Board", "Cookware Set", "Kitchen Gadget"],
                InterestCategory::Fashion => vec!["Designer Jacket", "Sneakers", "Watch", "Sunglasses"],
                _ => vec!["Popular Item", "Bestseller", "Featured Product", "Top Rated"],
            };
            products.choose(rng).unwrap().to_string()
        } else {
            "Product".to_string()
        }
    }

    fn get_news_headline<R: Rng>(&self, interest: &Option<InterestCategory>, rng: &mut R) -> String {
        if let Some(cat) = interest {
            let headlines = match cat {
                InterestCategory::Technology => vec!["Major Tech Company Announces New Product", "Breakthrough in AI Research", "Cybersecurity Alert"],
                InterestCategory::Politics => vec!["Election Results Coming In", "Policy Change Announced", "Political Summit Concludes"],
                InterestCategory::Sports => vec!["Championship Game Recap", "Player Breaks Record", "Team Makes Playoffs"],
                InterestCategory::Science => vec!["New Scientific Discovery", "Research Findings Published", "Space Mission Update"],
                _ => vec!["Breaking News", "Latest Updates", "Today's Top Stories"],
            };
            headlines.choose(rng).unwrap().to_string()
        } else {
            "Breaking News".to_string()
        }
    }

    fn get_research_topic<R: Rng>(&self, interest: &Option<InterestCategory>, rng: &mut R) -> String {
        if let Some(cat) = interest {
            let topics = match cat {
                InterestCategory::Science => vec!["Quantum Physics", "Climate Change", "Genetics", "Astronomy"],
                InterestCategory::Technology => vec!["Machine Learning", "Blockchain", "Quantum Computing", "Cybersecurity"],
                InterestCategory::Programming => vec!["Design Patterns", "Data Structures", "Algorithms", "Software Architecture"],
                InterestCategory::DataScience => vec!["Statistical Analysis", "Data Visualization", "Predictive Modeling", "Big Data"],
                _ => vec!["General Knowledge", "Encyclopedia", "Reference Material", "Study Guide"],
            };
            topics.choose(rng).unwrap().to_string()
        } else {
            "General Topic".to_string()
        }
    }

    fn get_page_title<R: Rng>(&self, interest: &Option<InterestCategory>, rng: &mut R) -> String {
        if let Some(cat) = interest {
            format!("{:?} Information", cat)
        } else {
            "General Page".to_string()
        }
    }

    fn generate_video_id<R: Rng>(&self, rng: &mut R) -> String {
        const CHARS: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
        (0..11)
            .map(|_| CHARS[rng.gen_range(0..CHARS.len())] as char)
            .collect()
    }
}

struct DomainDatabase {
    shopping: Vec<&'static str>,
    news: Vec<&'static str>,
    research: Vec<&'static str>,
}

impl DomainDatabase {
    fn new() -> Self {
        Self {
            shopping: vec!["amazon.com", "ebay.com", "etsy.com", "walmart.com", "bestbuy.com"],
            news: vec!["bbc.com", "cnn.com", "reuters.com", "theguardian.com", "nytimes.com"],
            research: vec!["wikipedia.org", "britannica.com", "scholar.google.com", "arxiv.org"],
        }
    }

    fn get_shopping_domain<R: Rng>(&self, rng: &mut R) -> &str {
        self.shopping.choose(rng).unwrap()
    }

    fn get_news_domain<R: Rng>(&self, rng: &mut R) -> &str {
        self.news.choose(rng).unwrap()
    }

    fn get_research_domain<R: Rng>(&self, rng: &mut R) -> &str {
        self.research.choose(rng).unwrap()
    }

    fn get_interest_domain<R: Rng>(&self, interest: &Option<InterestCategory>, rng: &mut R) -> &str {
        if let Some(cat) = interest {
            match cat {
                InterestCategory::Technology => *vec!["techcrunch.com", "theverge.com", "arstechnica.com"].choose(rng).unwrap(),
                InterestCategory::Gaming => *vec!["ign.com", "gamespot.com", "polygon.com"].choose(rng).unwrap(),
                InterestCategory::Sports => *vec!["espn.com", "bleacherreport.com", "si.com"].choose(rng).unwrap(),
                InterestCategory::Cooking => *vec!["allrecipes.com", "foodnetwork.com", "bonappetit.com"].choose(rng).unwrap(),
                _ => "example.com",
            }
        } else {
            "example.com"
        }
    }
}
