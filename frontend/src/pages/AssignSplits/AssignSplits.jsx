import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AssignSplits.css';

const AssignSplits = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [people, setPeople] = useState('');
  const [assignments, setAssignments] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [finalizing, setFinalizing] = useState(false);
  const [storeOverride, setStoreOverride] = useState('');
  const [dateOverride, setDateOverride] = useState('');

  useEffect(() => {
    const fetchReceipt = async () => {
      const res = await fetch(`http://localhost:5000/server/receipt/processed-receipts/${id}`, {
        credentials: 'include',
      });
      
      const data = await res.json();
      setReceipt(data);
      setStoreOverride(data.store || '');
      setDateOverride(data.date || '');


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

  const handleFinalizeSplit = async () => {
    setErrorMessage('');
    setFinalizing(true);
  
    // Validate: each item must be assigned to at least one person
    const unassigned = receipt.items.some((_, index) => !assignments[index] || assignments[index].length === 0);
  
    if (unassigned) {
      setErrorMessage('⚠️ Please assign at least one person to each item.');
      setFinalizing(false);
      return;
    }
  
    try {
      const res = await fetch(`http://localhost:5000/server/receipt/save-splits/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // for sessions
        body: JSON.stringify({ assignments,
          store: storeOverride, 
          date: dateOverride 
         }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        console.log("✅ Split saved:", data);
        navigate(`/view-splits/${data.splitId}`);
      } else {
        setErrorMessage(data.message || 'Something went wrong.');
      }
    } catch (err) {
      console.error('❌ Finalize error:', err);
      setErrorMessage('Failed to finalize split.');
    } finally {
      setFinalizing(false);
    }
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
        <div className="store-date-row">
        <div className="input-group">
          <label htmlFor="store">Store Name (optional):</label>
          <input
            type="text"
            id="store"
            value={storeOverride}
            onChange={(e) => setStoreOverride(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="date">Date (optional):</label>
          <input
            type="date"
            id="date"
            value={dateOverride}
            onChange={(e) => setDateOverride(e.target.value)}
          />
        </div>
      </div>


        <div className="item-list">
          {receipt.items.map((item, index) => (
            <div key={index} className="item-block">
              <div className="item-header">
                <span className="item-name">{item.name}</span>
                <span className="item-price">${item.price.toFixed(2)}</span>
              </div>

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
          <div className="summary-list">
            <div className="item-block summary-item">
              <div className="item-header">
                <span className="item-name">Tax</span>
                <span className="item-price">${receipt.tax?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
            <div className="item-block summary-item">
              <div className="item-header">
                <span className="item-name">Tip</span>
                <span className="item-price">${receipt.tip?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
            <div className="item-block summary-item">
              <div className="item-header">
                <span className="item-name">Discount</span>
                <span className="item-price">-${Math.abs(receipt.discount)?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
            <div className="item-block summary-item">
              <div className="item-header">
                <span className="item-name">Total</span>
                <span className="item-price">${receipt.total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>
          

        </div>

        {errorMessage && (
        <p style={{ color: 'salmon', fontWeight: '500', marginTop: '10px' }}>{errorMessage}</p>
        )}

        <button className="assign-btn" onClick={handleFinalizeSplit} disabled={finalizing}>
        {finalizing ? 'Finalizing...' : 'Finalize Split'}
        </button>

      </div>
    </div>
  );
};

export default AssignSplits;
