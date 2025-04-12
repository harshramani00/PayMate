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

    doc.setFontSize(16);
    doc.text(`Split Summary - ${store}`, 14, 18);
    doc.setFontSize(12);
    doc.text(`Date: ${date}`, 14, 26);

    const { splits, itemizedSplits } = splitData;

    const tableData = Object.entries(splits).map(([name, values]) => [
      name,
      values.itemsTotal.toFixed(2),
      values.tax.toFixed(2),
      values.tip?.toFixed(2) || '0.00',
      `-${Math.abs(values.discount).toFixed(2)}`,
      values.total.toFixed(2),
    ]);

    const totals = ['Total'].concat(
      ['itemsTotal', 'tax', 'tip', 'discount', 'total'].map(key =>
        Object.values(splits).reduce((acc, v) => acc + v[key], 0).toFixed(2)
      )
    );

    autoTable(doc, {
      startY: 30,
      head: [['Person', 'Items Total ($)', 'Tax ($)', 'Tip ($)', 'Discount ($)', 'Total ($)']],
      body: tableData,
      foot: [totals],
      theme: 'grid',
      headStyles: {
        fillColor: [21, 82, 99],
        textColor: 255,
      },
      footStyles: {
        fillColor: [230, 240, 245],
        textColor: 20,
        fontStyle: 'bold',
        lineWidth: 0.3,
        lineColor: [40, 40, 40],
      },
      styles: {
        halign: 'center',
        fontSize: 11,
        lineColor: [80, 80, 80],
        lineWidth: 0.2,
      },
    });

    // ➕ Add itemized breakdown
    if (itemizedSplits && itemizedSplits.length > 0) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Item-wise Breakdown', 14, 18);

      const itemTable = [];
      itemizedSplits.forEach(entry => {
        entry.assignedTo.forEach((person, idx) => {
          itemTable.push([entry.itemName, person, entry.amounts[idx].toFixed(2)]);
        });
      });

      autoTable(doc, {
        startY: 25,
        head: [['Item', 'Person', 'Amount ($)']],
        body: itemTable,
        theme: 'grid',
        styles: { halign: 'center', fontSize: 11 },
      });
    }

    doc.setFontSize(10);
    doc.text('Automated by PayMate.', 14, doc.lastAutoTable.finalY + 10);

    doc.save('split-summary.pdf');
  };

  if (!splitData) return <div className="view-container"><h2>Loading split...</h2></div>;

  const { splits, receipt, itemizedSplits } = splitData;

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
              <th>Person</th>
              <th>Items Total ($)</th>
              <th>Tax ($)</th>
              <th>Tip ($)</th>
              <th>Discount ($)</th>
              <th><strong>Total ($)</strong></th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(splits).map(([name, values]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{values.itemsTotal.toFixed(2)}</td>
                <td>{values.tax.toFixed(2)}</td>
                <td>{values.tip?.toFixed(2) || '0.00'}</td>
                <td>{values.discount.toFixed(2)}</td>
                <td><strong>{values.total.toFixed(2)}</strong></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td><strong>Total</strong></td>
              <td>{Object.values(splits).reduce((acc, v) => acc + v.itemsTotal, 0).toFixed(2)}</td>
              <td>{Object.values(splits).reduce((acc, v) => acc + v.tax, 0).toFixed(2)}</td>
              <td>{Object.values(splits).reduce((acc, v) => acc + v.tip, 0).toFixed(2)}</td>
              <td>{Object.values(splits).reduce((acc, v) => acc + v.discount, 0).toFixed(2)}</td>
              <td><strong>{Object.values(splits).reduce((acc, v) => acc + v.total, 0).toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Item-wise breakdown display */}
      {itemizedSplits && (
        <div className="itemized-table">
          <h3>Detailed Item-wise Split</h3>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Person</th>
                <th>Amount ($)</th>
              </tr>
            </thead>
            <tbody>
            {itemizedSplits.map((entry, i) =>
            entry.shares.map((share, idx) => (
              <tr key={`${i}-${share.person}`}>
                <td>{entry.itemName}</td>
                <td>{share.person}</td>
                <td>{share.amount.toFixed(2)}</td>
              </tr>
            ))
          )}

            </tbody>
          </table>
        </div>
      )}

      <button className="download-btn" onClick={downloadPDF}>Download PDF</button>
    </div>
  );
};

export default ViewSplits;
