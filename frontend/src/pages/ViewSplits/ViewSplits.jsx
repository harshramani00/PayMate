import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import './ViewSplits.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ViewSplits = () => {
  const { splitId } = useParams();
  const [splitData, setSplitData] = useState(null);
  const tableRef = useRef(null);

  useEffect(() => {
    const fetchSplit = async () => {
      const res = await fetch(`http://localhost:5000/server/splits/${splitId}`, {
        credentials: 'include',
      });
      const data = await res.json();
      setSplitData(data);
    };

    fetchSplit();
  }, [splitId]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    const store = splitData?.receipt?.store || 'Unknown Store';
    const date = splitData?.receipt?.date || 'Unknown Date';
    const { splits, itemizedSplits } = splitData;
    const people = Object.keys(splits);
  
    doc.setFontSize(16);
    doc.text(`Split Summary - ${store}`, 14, 18);
    doc.setFontSize(12);
    doc.text(`Date: ${date}`, 14, 26);
  
    const headers = ['Item', ...people, 'Total ($)'];
  
    const itemRows = itemizedSplits.map(entry => {
      const row = [entry.itemName];
      let total = 0;
      const personMap = {};
      entry.shares?.forEach(({ person, amount }) => {
        personMap[person] = amount;
        total += amount;
      });
  
      people.forEach(name => {
        row.push((personMap[name] || 0).toFixed(2));
      });
  
      row.push(total.toFixed(2));
      return row;
    });
  
    // Special rows with highlighting logic
    const highlightRowKeys = ['tax', 'tip', 'discount'];
    const specialRows = highlightRowKeys.map(key => {
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      const row = [label];
      let rowTotal = 0;
  
      people.forEach(name => {
        let val = splits[name][key] || 0;
        if (key === 'discount') val = -Math.abs(val);
        rowTotal += val;
        row.push(val.toFixed(2));
      });
  
      row.push(rowTotal.toFixed(2));
      return { row, key };
    });
  
    const totalRow = (() => {
      const row = ['Total'];
      let rowTotal = 0;
  
      people.forEach(name => {
        const val = splits[name].total || 0;
        rowTotal += val;
        row.push(val.toFixed(2));
      });
  
      row.push(rowTotal.toFixed(2));
      return row;
    })();
  
    const body = [...itemRows, ...specialRows.map(s => s.row)];
  
    autoTable(doc, {
      startY: 32,
      head: [headers],
      body: body,
      foot: [totalRow],
      theme: 'grid',
      styles: {
        halign: 'center',
        fontSize: 11,
        lineColor: [0, 0, 0], // darker borders
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [21, 82, 99],
        textColor: 255,
      },
      footStyles: {
        fillColor: [225, 235, 245],
        textColor: 0,
        fontStyle: 'bold',
      },
      didParseCell: function (data) {
        // Highlight special rows (tax, tip, discount)
        const label = data.row.raw?.[0];
  
        if (['Tax', 'Tip', 'Discount'].includes(label)) {
          data.cell.styles.fillColor = [210, 236, 240]; // soft blue
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });
  
    doc.setFontSize(10);
    doc.text('Automated by PayMate.', 14, doc.lastAutoTable.finalY + 10);
    doc.save('split-summary.pdf');
  };
  

  if (!splitData) return <div className="view-container"><h2>Loading split...</h2></div>;

  const { splits, receipt, itemizedSplits } = splitData;
  const people = Object.keys(splits);

  return (
    <div className="view-container">
      <h2>Final Split Summary</h2>
      <p style={{ color: '#bbe4e9', marginBottom: '10px' }}>
        <strong>Store:</strong> {receipt?.store || 'Unknown Store'} &nbsp;&nbsp;
        <strong>Date:</strong> {receipt?.date || 'N/A'}
      </p>

      <div className="split-table" ref={tableRef}>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              {people.map(name => <th key={name}>{name}</th>)}
              <th>Total ($)</th>
            </tr>
          </thead>
          <tbody>
            {itemizedSplits.map((entry, i) => {
              const rowMap = {};
              let total = 0;
              entry.shares?.forEach(({ person, amount }) => {
                rowMap[person] = amount;
                total += amount;
              });

              return (
                <tr key={i}>
                  <td>{entry.itemName}</td>
                  {people.map(person => (
                    <td key={person}>{(rowMap[person] || 0).toFixed(2)}</td>
                  ))}
                  <td>{total.toFixed(2)}</td>
                </tr>
              );
            })}

            {['tax', 'tip', 'discount'].map(label => {
              const labelName = label.charAt(0).toUpperCase() + label.slice(1);
              const values = people.map(p => {
                let val = splits[p][label] || 0;
                return label === 'discount' ? -Math.abs(val) : val;
              });
              const rowTotal = values.reduce((a, b) => a + b, 0);

              return (
                <tr key={label} className="highlight-row">
                  <td><strong>{labelName}</strong></td>
                  {values.map((val, idx) => (
                    <td key={idx}>{val.toFixed(2)}</td>
                  ))}
                  <td><strong>{rowTotal.toFixed(2)}</strong></td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="total-footer">
              <td><strong>Total</strong></td>
              {people.map(name => (
                <td key={name}><strong>{(splits[name].total || 0).toFixed(2)}</strong></td>
              ))}
              <td><strong>{
                Object.values(splits).reduce((acc, v) => acc + v.total, 0).toFixed(2)
              }</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <button className="download-btn" onClick={downloadPDF}>Download PDF</button>
    </div>
  );
};

export default ViewSplits;
