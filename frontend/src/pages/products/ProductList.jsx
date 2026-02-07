import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    getFilteredRowModel,
    getPaginationRowModel,
  } from "@tanstack/react-table";
  
  import { useEffect, useState, useMemo, useContext } from "react";
  import { Link } from "react-router-dom";
  import api from "../../api/axios";
  import { AuthContext } from "../../context/AuthContext";
  import ProductCreateModal from "../../components/products/ProductCreateModal";
  
  export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [pagination, setPagination] = useState({
      pageIndex: 0,
      pageSize: 10,
    });
  
    const { user } = useContext(AuthContext);
  
    useEffect(() => {
      fetchProducts();
    }, []);
  
    const fetchProducts = async () => {
      const res = await api.get("/api/products");
      setProducts(res.data);
    };
  
    const columns = useMemo(() => {
      const baseColumns = [
        {
          header: "Name",
          accessorKey: "name",
        },
        {
          header: "Item ID",
          accessorKey: "itemId",
        },
        {
          header: "Category",
          accessorKey: "category",
        },
        {
          header: "Description",
          accessorKey: "description",
        },
        {
          header: "Stock",
          accessorKey: "stock",
          cell: (info) => {
            const value = info.getValue();
            return (
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  value === 0
                    ? "bg-red-100 text-red-700"
                    : value < 10
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {value}
              </span>
            );
          },
        },
        {
          header: "Selling Price",
          accessorKey: "sellingPrice",
          cell: (info) => `₹ ${info.getValue()}`,
        },
      ];
  
      if (user.role === "owner") {
        baseColumns.splice(4, 0, {
          header: "Cost Price",
          accessorKey: "costPrice",
          cell: (info) => `₹ ${info.getValue()}`,
        });
  
        baseColumns.push({
          header: "Stock Value",
          accessorKey: "stockValue",
          cell: (info) => `₹ ${info.getValue()}`,
        });
      }
  
      return baseColumns;
    }, [user.role]);
  
    const table = useReactTable({
      data: products,
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
  
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Product Management
          </h1>
  
          {user.role === "owner" && (
            <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            + Add Product
          </button>          
          )}
        </div>
  
        {/* Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
  
          {/* Search */}
          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder="Search products..."
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
                    key={row.id}
                    className="hover:bg-blue-50 transition border-t"
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
  
            {products.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                No products available
              </div>
            )}
          </div>
  
          {/* Pagination */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mt-6">
  
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
  
            <div className="flex items-center gap-4">
  
              <div className="flex items-center gap-2 text-sm">
                <span>Rows per page:</span>
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={(e) =>
                    table.setPageSize(Number(e.target.value))
                  }
                  className="border border-gray-300 rounded-lg px-2 py-1"
                >
                  {[10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
  
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
              >
                Previous
              </button>
  
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
        <ProductCreateModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={fetchProducts}
        />
        )}
      </div>
    );
  }  