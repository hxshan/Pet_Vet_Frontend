import React, { useState } from 'react';


const petDatabase = [
  { id: 'P001', name: 'Max', species: 'Dog', breed: 'Golden Retriever', owner: 'John Smith' },
  { id: 'P002', name: 'Whiskers', species: 'Cat', breed: 'Persian', owner: 'Sarah Johnson' },
  { id: 'P003', name: 'Buddy', species: 'Dog', breed: 'Labrador', owner: 'Mike Davis' },
  { id: 'P004', name: 'Luna', species: 'Cat', breed: 'Siamese', owner: 'Emily Wilson' },
  { id: 'P005', name: 'Charlie', species: 'Bird', breed: 'Cockatiel', owner: 'David Brown' },
];

const SearchDropdown = ({ searchTerm, onSearch, onSelect }) => {
  const [filteredPets, setFilteredPets] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = (value) => {
    onSearch(value);
    if (value.length > 0) {
      const filtered = petDatabase.filter(pet =>
        pet.id.toLowerCase().includes(value.toLowerCase()) ||
        pet.name.toLowerCase().includes(value.toLowerCase()) ||
        pet.owner.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredPets(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleSelectPet = (pet) => {
    setShowDropdown(false);
    onSelect(pet);
  };

  return (
    <div className="search-box">
      <label htmlFor="petSearch">Search Pet by ID, Name, or Owner</label>
      <input
        id="petSearch"
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Enter Pet ID, name, or owner name..."
        autoComplete="off"
      />
      
      {showDropdown && filteredPets.length > 0 && (
        <div className="dropdown">
          {filteredPets.map(pet => (
            <div
              key={pet.id}
              className="dropdown-item"
              onClick={() => handleSelectPet(pet)}
            >
              <strong>{pet.id}</strong> - {pet.name} ({pet.species})
              <br />
              <small>Owner: {pet.owner}</small>
            </div>
          ))}
        </div>
      )}
      
      {showDropdown && filteredPets.length === 0 && (
        <div className="dropdown">
          <div className="dropdown-item no-results">No pets found</div>
        </div>
      )}
    </div>
  );
};

export default SearchDropdown