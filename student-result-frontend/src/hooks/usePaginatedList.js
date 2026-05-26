import { useCallback, useEffect, useState } from "react";
import API from "../api/api";

export default function usePaginatedList(endpoint, { defaultSize = 10, extraParams = {}, enabled = true } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(defaultSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({ search: "", ...extraParams });

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = { page, size, ...filters };
      Object.keys(params).forEach((k) => {
        if (params[k] === "" || params[k] === null || params[k] === undefined) delete params[k];
      });
      const res = await API.get(endpoint, { params });
      const body = res.data || {};
      setData(body.content || []);
      setTotalElements(body.totalElements || 0);
      setTotalPages(body.totalPages || 0);
    } catch (err) {
      console.error(err);
      setData([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, size, filters, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateFilter = (key, value) => {
    setPage(0);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setPage(0);
    setFilters({ search: "", ...extraParams });
  };

  return {
    data,
    loading,
    page,
    setPage,
    size,
    setSize,
    totalElements,
    totalPages,
    filters,
    updateFilter,
    resetFilters,
    refresh: fetchData,
  };
}
