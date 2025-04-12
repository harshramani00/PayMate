import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './AssignSplits.css';

const AssignSplits = () => {
  const { id } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [people, setPeople] = useState('');
  const [assignments, setAssignments] = useState({});

  useEffect(() => {
    const fetchReceipt = async () => {
      const res = await fetch(`http://localhost:5000/server/receipt/processed-receipts/${id}`, {
        credentials: 'include',
      });
      const data = await res.json();
      setReceipt(data);

      const initial = {};
      data.items.forEach((item, i) => {
        initial[i] = [];
      });
      setAssignments(initial);
    };

    fetchReceipt();
  }, [id]);

  const handleCheckboxChange = (itemIndex, person) => {
    setAssignments((prev) => {
      const current = prev[itemIndex];
      const updated = current.includes(person)
        ? current.filter((p) => p !== person)
        : [...current, person];
      return { ...prev, [itemIndex]: updated };
    });
  };

  const peopleList = people.split(',').map((p) => p.trim()).filter(Boolean);

  if (!receipt) return <div className="assign-container"><h2>Loading receipt...</h2></div>;

  return (
    <div className="assign-container">
      <h2>Assign Splits</h2>

      <div className="assign-box">
        <label htmlFor="people">Enter the people involved (comma-separated):</label>
        <input
          type="text"
          id="people"
          value={people}
          onChange={(e) => setPeople(e.target.value)}
        />

        <div className="item-list">
          {receipt.items.map((item, index) => (
            <div key={index} className="item-block">
              <strong>{item.name}</strong> – ${item.price.toFixed(2)}
              <div className="checkbox-group">
                {peopleList.map((person) => (
                  <label key={`${index}-${person}`}>
                    <input
                      type="checkbox"
                      checked={assignments[index]?.includes(person) || false}
                      onChange={() => handleCheckboxChange(index, person)}
                    />
                    {person}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Optional: add a Save Splits button later */}
      </div>
    </div>
  );
};

export default AssignSplits;
