class MenuItem {
    constructor(data) {
      this._data = data;
    }
  
   
    get data() {
      return this._data;
    }
  
    // Setter to update the data
    set data(newData) {
      this._data = newData;
    }
  
    // Method to get data by date
    getDataByDate(date) {
      return this._data.filter(item => item.date === date);
    }
  
    // Method to add a new item
    addItem(newItem) {
      this._data.push(newItem);
    }
  
    // Method to update an item by date
    updateItem(date, updatedItem) {
      this._data = this._data.map(item => 
        item.date === date ? { ...item, ...updatedItem } : item
      );
    }
  }
  
  // Initial data
  const initialData = [
    {
      date: "2024-10-25",
      type: "Veg Lunch",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnZovlevz8SutD4Y3OAbDqEcbqiu-QV12l5w&s",
      quantity: 2,
      price: 99,
      category_id: 2
    },
    {
      date: "2024-10-26",
      type: "Veg Lunch",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnZovlevz8SutD4Y3OAbDqEcbqiu-QV12l5w&s",
      quantity: 2,
      price: 99,
      category_id: 2
    }
  ];
  
  // Create instance of MenuItem class
  const menu = new MenuItem(initialData);
  
  // Using the getter to access the data
  console.log("All data:", menu.data);
  
  // Using the method to get data by date
  console.log("Data for 2024-10-25:", menu.getDataByDate("2024-10-25"));
  
  // Adding a new item
  menu.addItem({
    date: "2024-10-27",
    type: "Non-Veg Dinner",
    image: "https://example.com/nonveg.jpg",
    quantity: 1,
    price: 199,
    category_id: 3
  });
  
  console.log("Data after adding new item:", menu.data);
  
  // Updating an item by date
  menu.updateItem("2024-10-25", { quantity: 3, price: 109 });
  
  console.log("Data after updating 2024-10-25:", menu.data);
  
  // Using the setter to overwrite all data
  menu.data = [{
    date: "2024-11-01",
    type: "Special Dinner",
    image: "https://example.com/special.jpg",
    quantity: 1,
    price: 299,
    category_id: 4
  }];
  
  console.log("All data after setter update:", menu.data);
  