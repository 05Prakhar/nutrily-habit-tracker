
export interface Food {
  id: string;
  name: string;
  category: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export const foodDatabase: Food[] = [
  // Proteins
  {
    id: "chicken-breast",
    name: "Chicken Breast",
    category: "Protein",
    servingSize: "100g",
    calories: 165,
    protein: 31,
    carbs: 0,
    fats: 3.6,
    fiber: 0,
    sodium: 74
  },
  {
    id: "salmon",
    name: "Salmon",
    category: "Protein",
    servingSize: "100g",
    calories: 208,
    protein: 22,
    carbs: 0,
    fats: 12,
    fiber: 0,
    sodium: 59
  },
  {
    id: "eggs",
    name: "Eggs",
    category: "Protein",
    servingSize: "1 large egg",
    calories: 70,
    protein: 6,
    carbs: 0.6,
    fats: 5,
    fiber: 0,
    sodium: 70
  },
  {
    id: "greek-yogurt",
    name: "Greek Yogurt",
    category: "Protein",
    servingSize: "150g",
    calories: 100,
    protein: 17,
    carbs: 6,
    fats: 0,
    fiber: 0,
    sodium: 50
  },
  
  // Carbs
  {
    id: "brown-rice",
    name: "Brown Rice",
    category: "Carbs",
    servingSize: "100g cooked",
    calories: 111,
    protein: 2.6,
    carbs: 23,
    fats: 0.9,
    fiber: 1.8,
    sodium: 5
  },
  {
    id: "oats",
    name: "Oatmeal",
    category: "Carbs",
    servingSize: "40g dry",
    calories: 150,
    protein: 5,
    carbs: 27,
    fats: 3,
    fiber: 4,
    sodium: 0
  },
  {
    id: "banana",
    name: "Banana",
    category: "Carbs",
    servingSize: "1 medium",
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fats: 0.4,
    fiber: 3.1,
    sugar: 14,
    sodium: 1
  },
  {
    id: "sweet-potato",
    name: "Sweet Potato",
    category: "Carbs",
    servingSize: "100g",
    calories: 86,
    protein: 1.6,
    carbs: 20,
    fats: 0.1,
    fiber: 3,
    sugar: 4.2,
    sodium: 54
  },
  
  // Vegetables
  {
    id: "broccoli",
    name: "Broccoli",
    category: "Vegetables",
    servingSize: "100g",
    calories: 34,
    protein: 2.8,
    carbs: 7,
    fats: 0.4,
    fiber: 2.6,
    sugar: 1.5,
    sodium: 33
  },
  {
    id: "spinach",
    name: "Spinach",
    category: "Vegetables",
    servingSize: "100g",
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fats: 0.4,
    fiber: 2.2,
    sugar: 0.4,
    sodium: 79
  },
  {
    id: "avocado",
    name: "Avocado",
    category: "Fats",
    servingSize: "100g",
    calories: 160,
    protein: 2,
    carbs: 9,
    fats: 15,
    fiber: 7,
    sugar: 0.7,
    sodium: 7
  },
  
  // Common meals
  {
    id: "protein-smoothie",
    name: "Protein Smoothie",
    category: "Drinks",
    servingSize: "1 serving",
    calories: 250,
    protein: 25,
    carbs: 30,
    fats: 5,
    fiber: 4,
    sugar: 20,
    sodium: 150
  }
];

export const searchFoods = (query: string): Food[] => {
  if (!query.trim()) return foodDatabase;
  
  return foodDatabase.filter(food =>
    food.name.toLowerCase().includes(query.toLowerCase()) ||
    food.category.toLowerCase().includes(query.toLowerCase())
  );
};

export const getFoodById = (id: string): Food | undefined => {
  return foodDatabase.find(food => food.id === id);
};
