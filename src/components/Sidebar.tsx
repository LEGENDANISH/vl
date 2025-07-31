// import React from 'react';
// import { NavLink } from 'react-router-dom';

// const Sidebar = () => {
//   return (
//     <div className="w-16 bg-valorant-blue border-r border-gray-800 flex flex-col items-center py-6">
//       <div className="mb-10">
//         <div className="w-10 h-10 bg-valorant-red flex items-center justify-center rounded-full">
//           <span className="text-white text-xl font-bold">S</span>
//         </div>
//       </div>
//       <nav className="flex flex-col items-center space-y-8">
//         <NavLink
//           to="/"
//           className={({ isActive }) =>
//             `w-10 h-10 flex items-center justify-center rounded-md ${isActive ? 'bg-valorant-red text-white' : 'text-gray-400 hover:bg-gray-800'}`
//           }
//           end
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//             <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
//           </svg>
//         </NavLink>
//         <NavLink
//           to="/library"
//           className={({ isActive }) =>
//             `w-10 h-10 flex items-center justify-center rounded-md ${isActive ? 'bg-valorant-red text-white' : 'text-gray-400 hover:bg-gray-800'}`
//           }
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//             <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
//           </svg>
//         </NavLink>
//         <NavLink
//           to="/store"
//           className={({ isActive }) =>
//             `w-10 h-10 flex items-center justify-center rounded-md ${isActive ? 'bg-valorant-red text-white' : 'text-gray-400 hover:bg-gray-800'}`
//           }
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//             <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
//           </svg>
//         </NavLink>
//         <NavLink
//           to="/settings"
//           className={({ isActive }) =>
//             `w-10 h-10 flex items-center justify-center rounded-md ${isActive ? 'bg-valorant-red text-white' : 'text-gray-400 hover:bg-gray-800'}`
//           }
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//             <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
//           </svg>
//         </NavLink>
//       </nav>
//     </div>
//   );
// };

// export default Sidebar;
