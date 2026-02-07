import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    getFilteredRowModel,
    getPaginationRowModel,
  } from "@tanstack/react-table";
  
  import { useEffect, useState, useMemo, useContext } from "react";
  import { useNavigate } from "react-router-dom";
  import api from "../../api/axios";
  import { AuthContext } from "../../context/AuthContext";
  import SalesCreateModal from "../../components/sales/SalesCreateModal";
  import SalesDetailsModal from "../../components/sales/SalesDetailsModal";
  export default function SalesList() {
    const today = new Date().toISOString().split("T")[0];
    const [fromDate, setFromDate] = useState(today);
    const [toDate, setToDate] = useState(today);
    const [sales, setSales] = useState([]);
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { user } = useContext(AuthContext);
    const [selectedSale, setSelectedSale] = useState(null);
    const navigate = useNavigate();
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const totalSalesAmount = sales.reduce(
        (sum, sale) => sum + Number(sale.totalAmount),
        0
      );
      
      const totalProfit = sales.reduce(
        (sum, sale) => sum + Number(sale.totalProfit || 0),
        0
      );
      
    useEffect(() => {
      fetchSales();
    }, []);
  
    const fetchSales = async () => {
        if (!fromDate || !toDate) {
          return;
        }
      
        try {
          const res = await api.get(
            `/api/sales?from=${fromDate}&to=${toDate}`
          );
          console.log(res.data);
          
          setSales(res.data);
        } catch (err) {
        }
    };
      
    const downloadCSV = () => {
      if (sales.length === 0) {
        alert("No data to download");
        return;
      }
    
      const isOwner = user.role === "owner";
    
      // Header Row
      const headers = [
        "Invoice No",
        "Date",
        "Payment Type",
        "Total Amount",
        ...(isOwner ? ["Total Profit"] : [])
      ];
    
      // Data Rows
      const rows = sales.map((sale) => [
        sale.invoiceNo,
        new Date(sale.createdAt).toLocaleDateString(),
        sale.paymentType,
        sale.totalAmount,
        ...(isOwner ? [sale.totalProfit || 0] : [])
      ]);
    
      // Add empty row before totals
      rows.push([]);
    
      // Add summary row
      rows.push([
        "TOTAL",
        "",
        "",
        totalSalesAmount.toFixed(2),
        ...(isOwner ? [totalProfit.toFixed(2)] : [])
      ]);
    
      // Convert to CSV string
      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers, ...rows]
          .map(row => row.join(","))
          .join("\n");
    
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
    
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `sales_report_${fromDate}_to_${toDate}.csv`
      );
    
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
      
    const columns = useMemo(() => {
      const baseColumns = [
        {
          header: "Invoice No",
          accessorKey: "invoiceNo",
        },
        {
          header: "Date",
          accessorKey: "createdAt",
          cell: (info) =>
            new Date(info.getValue()).toLocaleDateString(),
        },
        {
          header: "Payment Type",
          accessorKey: "paymentType",
        },
        {
          header: "Total Amount",
          accessorKey: "totalAmount",
          cell: (info) => (
            <span className="font-semibold text-gray-800">
              ₹ {info.getValue()}
            </span>
          ),
        },
      ];
  
      if (user.role === "owner") {
        baseColumns.push({
          header: "Total Profit",
          accessorKey: "totalProfit",
          cell: (info) => (
            <span className="font-semibold text-green-600">
              ₹ {info.getValue()}
            </span>
          ),
        });
      }
  
      return baseColumns;
    }, [user.role]);

    const table = useReactTable({
        data: sales,
        columns,
        state: {
          sorting,
          globalFilter,
          pagination,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* Header Section */}
        <div className="block flex-wrap gap-4 items-center mb-6">

        <h1 className="text-2xl font-bold text-gray-800">
            Sales Report
        </h1>
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="flex flex-wrap gap-4 items-end">
<       div>
          <label className="block text-sm font-semibold mb-1">
                From Date
          </label>
          <input
              type="date"
              value={fromDate}
              max={today}
              onChange={(e) => {
                setFromDate(e.target.value);

                if (toDate && e.target.value > toDate) {
                  setToDate("");
                }
              }}
              className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">
              To Date
          </label>
          <input
              type="date"
              value={toDate}
              min={fromDate || ""}
              max={today}
              onChange={(e) => setToDate(e.target.value)}
              className="border p-2 rounded"
          />
        </div>
        <button
            onClick={fetchSales}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
            Load
        </button>

        <button
            onClick={downloadCSV}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
            Download
        </button>

        <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gray-800 text-white px-4 py-2 rounded"
        >
            + New Sale
        </button>

        </div>
        </div>
        </div>
  
        {/* Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
  
          {/* Search Bar */}
          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder="Search sales..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 p-2 rounded-lg w-72 outline-none transition"
            />
          </div>
  
          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="px-4 py-3 text-left cursor-pointer select-none font-semibold"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
  
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted()] ?? null}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
  
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row._id}
                    className="hover:bg-blue-50 transition cursor-pointer border-t"
                    onClick={() =>
                        setSelectedSale(row.original._id)
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-gray-700">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
  
            {sales.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                No sales available
              </div>
            )}
          </div>
  
          {/* Pagination Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mt-6">
        <div className="mt-6 bg-gray-100 p-4 rounded-lg flex justify-between">

        <div>
        <p className="text-sm text-gray-600">
            Total Sales Amount
        </p>
        <p className="text-xl font-bold text-gray-800">
            ₹ {totalSalesAmount.toFixed(2)}
        </p>
        </div>

        {user.role === "owner" && (
        <div>
            <p className="text-sm text-gray-600">
            Total Profit
            </p>
            <p className="text-xl font-bold text-green-600">
            ₹ {totalProfit.toFixed(2)}
            </p>
        </div>
        )}

        </div>

        {/* Left Side - Rows Info */}
        <div className="text-sm text-gray-600">
        Showing{" "}
        <span className="font-semibold">
            {table.getRowModel().rows.length}
        </span>{" "}
        of{" "}
        <span className="font-semibold">
            {table.getFilteredRowModel().rows.length}
        </span>{" "}
        results
        </div>

        {/* Right Side - Controls */}
        <div className="flex items-center gap-4">

        {/* Page Size Selector */}
        <div className="flex items-center gap-2 text-sm">
            <span>Rows per page:</span>
            <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
                table.setPageSize(Number(e.target.value));
            }}
            className="border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
            {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                {size}
                </option>
            ))}
            </select>
        </div>

        {/* Previous Button */}
        <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
        >
            Previous
        </button>

        {/* Page Info */}
        <span className="text-sm text-gray-700">
            Page{" "}
            <span className="font-semibold">
            {table.getState().pagination.pageIndex + 1}
            </span>{" "}
            of{" "}
            <span className="font-semibold">
            {table.getPageCount()}
            </span>
        </span>

        {/* Next Button */}
        <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
        >
            Next
        </button>
        </div>
        </div>

        </div>
        {showCreateModal && (
        <SalesCreateModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={fetchSales}
        />
        )}
        {selectedSale && (
        <SalesDetailsModal
            saleId={selectedSale}
            onClose={() => setSelectedSale(null)}
        />
        )}
      </div>
    );
}  