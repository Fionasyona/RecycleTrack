// src/services/educationService.js
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// Mock mode for testing
const MOCK_MODE = false;

// Mock articles data
const mockArticles = [
  {
    id: 1,
    title: "The Complete Guide to Plastic Recycling",
    category: "Plastic",
    author: "RecycleTrack Team",
    reading_time: 8,
    published_date: "2025-12-10",
    featured_image:
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800",
    excerpt:
      "Learn everything about plastic recycling, from identifying different types to proper disposal methods.",
    content: `
# The Complete Guide to Plastic Recycling

Plastic recycling is one of the most important steps we can take to protect our environment. This comprehensive guide will help you understand different types of plastics and how to recycle them properly.

## Understanding Plastic Types

Different plastics require different recycling processes. Here are the main types:

### 1. PET (Polyethylene Terephthalate) - #1
- **Found in:** Water bottles, soft drink bottles, food containers
- **Recyclable:** Yes, highly recyclable
- **What it becomes:** New bottles, carpets, clothing fibers

### 2. HDPE (High-Density Polyethylene) - #2
- **Found in:** Milk jugs, detergent bottles, shampoo bottles
- **Recyclable:** Yes, widely accepted
- **What it becomes:** New bottles, piping, plastic lumber

### 3. PVC (Polyvinyl Chloride) - #3
- **Found in:** Plumbing pipes, credit cards, vinyl records
- **Recyclable:** Limited - check with local facilities
- **Note:** Contains chlorine, requires special handling

### 4. LDPE (Low-Density Polyethylene) - #4
- **Found in:** Shopping bags, squeezable bottles, bread bags
- **Recyclable:** Some facilities accept it
- **Tip:** Return to grocery store collection bins

### 5. PP (Polypropylene) - #5
- **Found in:** Yogurt containers, bottle caps, straws
- **Recyclable:** Increasingly accepted
- **What it becomes:** Bins, trays, automotive parts

## Best Practices for Plastic Recycling

1. **Clean Before Recycling:** Rinse containers to remove food residue
2. **Remove Labels:** If possible, remove paper labels
3. **Check Numbers:** Look for the recycling symbol with a number
4. **Separate Caps:** Remove caps and recycle separately
5. **Flatten Bottles:** Save space in your recycling bin


## Impact of Plastic Recycling

- Saves 88% of energy compared to making new plastic
- Reduces landfill waste by 80%
- Prevents ocean pollution
- Conserves petroleum resources


Remember: Every plastic bottle you recycle makes a difference!
    `,
    tags: ["Plastic", "Recycling", "Environment", "Guide"],
    views: 1523,
    likes: 234,
  },
  {
    id: 2,
    title: "E-Waste: Why Proper Disposal Matters",
    category: "E-Waste",
    author: "Tech Green Initiative",
    reading_time: 6,
    published_date: "2025-12-10",
    featured_image:
      "https://i.pinimg.com/736x/25/8b/b8/258bb87f927b4ade573a9659a3d301d7.jpg",
    excerpt:
      "Electronic waste is growing rapidly. Learn why proper e-waste disposal is crucial for our health and environment.",
    content: `
# E-Waste: Why Proper Disposal Matters

Electronic waste (e-waste) is the fastest-growing waste stream globally. Understanding how to dispose of it properly is essential for protecting our environment and health.

## What is E-Waste?

E-waste includes any electronic device with a plug or battery:
- 📱 Mobile phones and tablets
- 💻 Computers and laptops
- 📺 Televisions and monitors
- 🎮 Gaming consoles
- 🔋 Batteries and chargers
- ⌚ Smart watches and fitness trackers
- 🖨️ Printers and scanners

## Why E-Waste is Dangerous

### Toxic Materials
E-waste contains hazardous substances:
- **Lead:** Found in monitors and circuit boards
- **Mercury:** Present in batteries and switches
- **Cadmium:** Used in rechargeable batteries
- **Arsenic:** In older semiconductor chips
- **Flame retardants:** In plastic casings

### Environmental Impact
When improperly disposed:
- Toxins leak into soil and groundwater
- Air pollution from burning e-waste
- Ocean contamination
- Wildlife poisoning

## Benefits of Proper E-Waste Recycling

### 1. Resource Recovery


### 2. Environmental Protection


### 3. Economic Value


## How to Dispose of E-Waste Properly

### Step 1: Data Security
- Delete all personal information
- Remove SIM cards and memory cards
- Factory reset devices
- Remove batteries if possible

### Step 2: Choose Disposal Method

**Option A: Certified E-Waste Centers**


**Option B: Manufacturer Take-Back Programs**

**Option C: Retailer Collection**

**Option D: Donation**

### Step 3: Preparation
- Remove all accessories
- Pack safely to prevent damage
- Keep receipt for tax deduction (if donating)


## Kenya's E-Waste Statistics

- 📊 Over 50,000 tons of e-waste generated annually
- 📈 Growing at 20% per year
- ♻️ Only 10% properly recycled
- 🎯 Goal: 30% recycling rate by 2030


Together, we can make a difference in reducing e-waste pollution!
    `,
    tags: ["E-Waste", "Electronics", "Safety", "Environment"],
    views: 2156,
    likes: 387,
  },
  {
    id: 3,
    title: "Composting 101: Turn Waste into Gold",
    category: "Organic",
    author: "Green Living Kenya",
    reading_time: 10,
    published_date: "2025-12-10",
    featured_image:
      "https://i.pinimg.com/1200x/8a/b9/fd/8ab9fd0cb00325e13b296552214943ac.jpg",
    excerpt:
      "Transform your kitchen and garden waste into nutrient-rich compost. A complete beginner's guide to home composting.",
    content: `
# Composting 101: Turn Waste into Gold


## What is Composting?

Composting is the natural process of decomposition that turns organic materials into a nutrient-rich soil conditioner called humus or compost.

## Benefits of Composting

### Environmental Benefits
- ♻️ Reduces landfill waste by 30%
- 🌍 Lowers methane emissions
- 💧 Reduces water usage in gardens
- 🌱 Prevents soil erosion

### Garden Benefits
- 🌿 Enriches soil naturally
- 🌸 Improves plant growth
- 🐛 Increases beneficial organisms
- 💪 Strengthens plant immunity

### Economic Benefits
- 💰 Free fertilizer
- 💵 Reduces need for chemicals
- 📉 Lowers waste disposal costs

## What Can You Compost?

### GREEN Materials (Nitrogen-rich)


### BROWN Materials (Carbon-rich)


### What NOT to Compost
❌ Meat, fish, or bones
❌ Dairy products
❌ Oils and fats
❌ Pet waste
❌ Diseased plants
❌ Weeds with seeds
❌ Treated wood products

## Types of Composting Methods

### 1. Hot Composting (Fast - 4-6 weeks)

### 2. Cold Composting (Slow - 6-12 months)

### 3. Vermicomposting (Worms - 2-3 months)

### 4. Trench Composting (In-ground)


Start small, learn as you go, and enjoy creating "black gold" for your garden!
    `,
    tags: ["Composting", "Organic", "Gardening", "DIY"],
    views: 1876,
    likes: 412,
  },
  {
    id: 4,
    title: "Paper Recycling: More Than Just Newspapers",
    category: "Paper",
    author: "Save Trees Initiative",
    reading_time: 5,
    published_date: "2025-12-10",
    featured_image:
      "https://i.etsystatic.com/5321214/r/il/a9c52b/6039763437/il_1588xN.6039763437_7wvj.jpg",
    excerpt:
      "Discover the importance of paper recycling and learn which paper products can be recycled in Kenya.",
    content: `
# Paper Recycling: More Than Just Newspapers

Paper recycling is one of the easiest and most effective ways to reduce waste. Learn what can be recycled and how to prepare materials properly.

## Why Paper Recycling Matters

### Environmental Impact
- 🌳 Saves 17 trees per ton of paper recycled
- 💧 Saves 7,000 gallons of water
- ⚡ Saves enough energy to power average home for 6 months
- 🏭 Reduces air pollution by 73%
- 🌍 Reduces greenhouse gases

### Economic Benefits
- Creates jobs in recycling industry
- Reduces manufacturing costs
- Saves money on waste disposal
- Supports local economy

## Types of Recyclable Paper
### ✅ Recyclable Paper Products
**Office Paper**

**Cardboard**

**Newspapers & Magazines**

**Paper Packaging**

### ❌ Not Recyclable

- Wax-coated paper
- Carbon paper
- Tissue paper (used)
- Paper towels/napkins (used)
- Thermal fax paper
- Metallic wrapping paper
- Stickers and labels
- Photographs


## Paper Recycling Statistics Kenya

- 📊 30% of waste is paper-based
- ♻️ 40% recycling rate (can improve!)
- 🎯 Target: 60% by 2030
- 💼 Growing recycling industry

## What Products are Made from Recycled Paper?

- 📰 Newspapers (85% recycled content)
- 📦 Cardboard boxes (70-100%)
- 🧻 Tissue products (20-100%)
- 📋 Office paper (20-30%)
- 🥚 Egg cartons (100%)
- 🏗️ Building materials
- 🎨 Art paper
- 🧱 Insulation

Small actions add up:
- Recycle junk mail: Saves 100 million trees/year
- Recycle newspapers: Saves 250 million trees/year
- Recycle office paper: Reduces landfill by 40% 


Start your paper recycling journey today!
    `,
    tags: ["Paper", "Recycling", "Trees", "Conservation"],
    views: 1432,
    likes: 289,
  },
];



const educationService = {
  // Get all articles
  getArticles: async (category = null) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const filtered = category
            ? mockArticles.filter((a) => a.category === category)
            : mockArticles;
          resolve(filtered);
        }, 300);
      });
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/education/articles/`, {
        params: { category },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching articles:", error);
      throw error;
    }
  },

  // Get single article
  getArticle: async (id) => {
    if (MOCK_MODE) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const article = mockArticles.find((a) => a.id === parseInt(id));
          console.log("Looking for article with id:", id, "Found:", article); // Debug
          if (article) {
            resolve(article);
          } else {
            reject(new Error("Article not found"));
          }
        }, 300);
      });
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/education/articles/${id}/`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching article:", error);
      throw error;
    }
  },

  // Like article
  likeArticle: async (id) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const article = mockArticles.find((a) => a.id === id);
          if (article) {
            article.likes += 1;
          }
          resolve({ likes: article?.likes || 0 });
        }, 100);
      });
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/education/articles/${id}/like/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error("Error liking article:", error);
      throw error;
    }
  },

  // Get categories
  getCategories: () => {
    return ["All", "Plastic", "E-Waste", "Organic", "Paper", "General"];
  },

  // Search articles
  searchArticles: (query) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const results = mockArticles.filter(
            (a) =>
              a.title.toLowerCase().includes(query.toLowerCase()) ||
              a.excerpt.toLowerCase().includes(query.toLowerCase()) ||
              a.tags.some((tag) =>
                tag.toLowerCase().includes(query.toLowerCase())
              )
          );
          resolve(results);
        }, 300);
      });
    }
  },
};

export default educationService;
