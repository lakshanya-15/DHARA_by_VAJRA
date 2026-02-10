export const ASSETS = [
   {
      id: 1,
      name: 'John Deere 5050D',
      type: 'Tractor',
      price: 800,
      image: 'https://cdn-icons-png.flaticon.com/512/2675/2675869.png', // Cartoon Tractor
      location: 'Lucknow, UP',
      owner: 'Ramesh Singh',
      available: true,
   },
   {
      id: 2,
      name: 'DJI Agras T40',
      type: 'Drone',
      price: 1500,
      image: 'https://cdn-icons-png.flaticon.com/512/3069/3069186.png', // Cartoon Drone
      location: 'Pune, MH',
      owner: 'Tech Farming Sol.',
      available: true,
   },
   {
      id: 3,
      name: 'JCB 3DX',
      type: 'JCB',
      price: 1200,
      image: 'https://cdn-icons-png.flaticon.com/512/2361/2361664.png', // Cartoon Excavator
      location: 'Patna, Bihar',
      owner: 'Suresh Yadav',
      available: false,
   },
   {
      id: 4,
      name: 'Mahindra 275 DI',
      type: 'Tractor',
      price: 700,
      image: 'https://cdn-icons-png.flaticon.com/512/2675/2675869.png',
      location: 'Nasik, MH',
      owner: 'Vijay Patil',
      available: true,
   },
   {
      id: 5,
      name: 'Harvest Master 9000',
      type: 'Harvester',
      price: 2500,
      image: 'https://cdn-icons-png.flaticon.com/512/5836/5836091.png', // Harvester Icon
      location: 'Punjab',
      owner: 'Golden Farms',
      available: true,
   },
];

export const BOOKINGS = [
   {
      id: 101,
      assetId: 1,
      assetName: 'John Deere 5050D',
      date: '2023-11-15',
      status: 'Completed',
      totalPrice: 3200,
   },
   {
      id: 102,
      assetId: 2,
      assetName: 'DJI Agras T40',
      date: '2023-12-01',
      status: 'Upcoming',
      totalPrice: 1500,
   },
];
