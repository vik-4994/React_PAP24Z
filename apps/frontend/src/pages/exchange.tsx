import type React from "react"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { trpc } from "@frontend/utils/trpc"
import { toast } from "react-toastify"
import { Loading } from "@frontend/components/Loading"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
// import "./datepicker-styles.css"
import { useQueryClient } from "@tanstack/react-query"

const PreferencesPage: React.FC = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<"preferences" | "pending">("preferences")
  const [filter, setFilter] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const itemsPerPage = 6

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null])
  const [startDate, endDate] = dateRange

  const queryClient = useQueryClient()

  const { data, isLoading, isError } = trpc.usos.findPreferences.useQuery()
  const acceptExchangeMutation = trpc.usos.acceptExchange.useMutation()
  const {
    data: pendingData,
    isLoading: isLoadingPending,
    refetch: refetchPending,
  } = trpc.usos.getAcceptedExchanges.useQuery({
    page,
    itemsPerPage,
    completed: false,
    group: null,
    startDate: startDate ? startDate.toISOString() : undefined,
    endDate: endDate ? endDate.toISOString() : undefined,
  })

  const [acceptedIds, setAcceptedIds] = useState<string[]>([])
  const [acceptedSubjects, setAcceptedSubjects] = useState<string[]>([])

  useEffect(() => {
    setPage(1) // Reset to page 1 when switching tabs
  }, [activeTab])

  useEffect(() => {
    if (activeTab === "pending") {
      refetchPending()
    }
  }, [activeTab, refetchPending])

  const handleAccept = async (
    id: string,
    student1Id: string,
    subjectName: string,
    groupFrom1: number,
    groupTo1: number,
    groupFrom2: number,
    groupTo2: number,
  ) => {
    setAcceptedIds((prev) => [...prev, id])
    setAcceptedSubjects((prev) => [...prev, subjectName])
    try {
      await acceptExchangeMutation.mutateAsync({
        student1Id,
        student2Id: "",
        subjectName,
        groupFrom1,
        groupTo1,
        groupFrom2,
        groupTo2,
      })
      toast.success(t("exchange_accepted") as string, {
        position: "top-center",
        autoClose: 3000,
      })
      queryClient.invalidateQueries(["usos", "getAcceptedExchanges"])
    } catch (error) {
      console.error(error)
      toast.error(t("error_accepting_exchange") as string, {
        position: "top-center",
        autoClose: 3000,
      })
      setAcceptedIds((prev) => prev.filter((itemId) => itemId !== id))
      setAcceptedSubjects((prev) => prev.filter((subject) => subject !== subjectName))
    }
  }

  const renderFilters = () => (
    <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div>
          <label htmlFor="filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("filter_by_subject")}
          </label>
          <input
            id="filter"
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={t("enter_subject")}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>
        <div></div>
        <div className="col-span-1 flex justify-end items-center">
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="w-12 h-12 mt-6 bg-gray-400 text-white text-sm rounded-xl focus:ring-2 focus:ring-white focus:outline-none hover:bg-white hover:text-black flex items-center justify-center dark:bg-gray-700"
          >
            {sortOrder === "asc" ? t("sort_desc") : t("sort_asc")}
          </button>
        </div>
      </div>
    </div>
  )

  const renderPreferences = () => {
    if (isLoading) return <Loading />
    if (isError)
      return <div className="text-center text-red-500 dark:text-red-300 p-4">{t("error_loading_preferences")}</div>

    const filteredData = data.filter(
      (pref) =>
        pref.subjectName.toLowerCase().includes(filter.toLowerCase()) &&
        !acceptedIds.includes(pref.id) &&
        !acceptedSubjects.includes(pref.subjectName),
    )

    const sortedData = [...filteredData].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.subjectName.localeCompare(b.subjectName)
      }
      return b.subjectName.localeCompare(a.subjectName)
    })

    const totalPages = Math.ceil(sortedData.length / itemsPerPage)
    const paginatedData = sortedData.slice((page - 1) * itemsPerPage, page * itemsPerPage)

    // Якщо на поточній сторінці менше 6 елементів і є наступна сторінка, додаємо елементи з наступної
    if (paginatedData.length < itemsPerPage && page < totalPages) {
      const nextPageData = sortedData.slice(page * itemsPerPage, (page + 1) * itemsPerPage)
      paginatedData.push(...nextPageData.slice(0, itemsPerPage - paginatedData.length))
    }

    return (
      <div>
        {renderFilters()}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paginatedData.map((pref) => (
            <div
              key={pref.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">{pref.subjectName}</h2>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t("your_group")}:</span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-100 rounded-full text-xs font-medium">
                      {pref.desiredGroupNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t("group_to_change")}:</span>
                    <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-xs font-medium">
                      {pref.currentGroupNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t("person")}:</span>
                    <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-xs font-medium">
                      {pref.user.first_name} {pref.user.last_name}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handleAccept(
                        pref.id,
                        pref.user.id,
                        pref.subjectName,
                        pref.currentGroupNumber,
                        pref.desiredGroupNumber,
                        pref.desiredGroupNumber,
                        pref.currentGroupNumber,
                      )
                    }
                    disabled={acceptedIds.includes(pref.id)}
                    className={`mt-4 w-full px-4 py-2 rounded-xl transition focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                      acceptedIds.includes(pref.id)
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600 focus:ring-green-500"
                    }`}
                  >
                    {acceptedIds.includes(pref.id) ? t("accepted") : t("accept")}
                  </button>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                    <p>
                      {t("created")}: {new Date(pref.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      {t("updated")}: {new Date(pref.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className={`px-4 py-2 text-sm rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 ${
              page === 1 ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {t("previous")}
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t("page")} {page} {t("of")} {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            className={`px-4 py-2 text-sm rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 ${
              page === totalPages ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {t("next")}
          </button>
        </div>
      </div>
    )
  }

  const renderPending = () => {
    if (isLoadingPending) return <Loading />

    if (!pendingData?.exchanges?.length) {
      return <div className="text-center text-gray-500 dark:text-gray-300 p-4">{t("no_pending_exchanges")}</div>
    }

    // Фільтрація та сортування (основна логіка залишається)
    const filteredData = pendingData.exchanges.filter((exchange) =>
      exchange.subjectName.toLowerCase().includes(filter.toLowerCase()),
    )

    const sortedData = [...filteredData].sort((a, b) => {
      return sortOrder === "asc"
        ? a.subjectName.localeCompare(b.subjectName)
        : b.subjectName.localeCompare(a.subjectName)
    })

    return (
      <>
        {renderFilters()}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedData.map((exchange) => (
            <div
              key={exchange.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">{exchange.subjectName}</h2>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t("your_group")}:</span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-100 rounded-full text-xs font-medium">
                      {exchange.groupTo1}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t("group_to_change")}:</span>
                    <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-xs font-medium">
                      {exchange.groupFrom1}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t("person")}:</span>
                    <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-xs font-medium">
                      {exchange.first_name1} {exchange.last_name1}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                    <p>
                      {t("created")}: {new Date(exchange.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      {t("updated")}: {new Date(exchange.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className={`px-4 py-2 text-sm rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 ${
              page === 1 ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {t("previous")}
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t("page")} {page} {t("of")} {pendingData.totalPages}
          </span>
          <button
            disabled={page === pendingData.totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className={`px-4 py-2 text-sm rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 ${
              page === pendingData.totalPages ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {t("next")}
          </button>
        </div>
      </>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">
        {t("preferences_and_pending")}
      </h1>
      <div className="flex justify-center space-x-8 mb-6">
        <button
          onClick={() => setActiveTab("preferences")}
          className={`text-lg font-bold ${
            activeTab === "preferences"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          {t("preferences")}
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`text-lg font-bold ${
            activeTab === "pending"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          {t("pending")}
        </button>
      </div>
      {activeTab === "preferences" ? renderPreferences() : renderPending()}
    </div>
  )
}

export default PreferencesPage

