interface DataTableProps {
  data: string[][];
  title?: string;
}

export function DataTable({ data, title }: DataTableProps) {
  if (!data || data.length === 0) {
    return <p className="no-data">No data available</p>;
  }

  const headers = data[0];
  const rows = data.slice(1);

  return (
    <div className="table-container">
      {title && <h2 className="table-title">{title}</h2>}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
