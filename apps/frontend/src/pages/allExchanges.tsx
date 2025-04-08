import type React from "react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { trpc } from "@frontend/utils/trpc"
import { Loading } from "@frontend/components/Loading"
import { useLocation } from "react-router-dom"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

const AcceptedExchangesPage: React.FC = () => {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState<"current" | "archive">("current")

  const [formFilters, setFormFilters] = useState({
    selectedSubjects: [] as string[],
    groupFilter: "",
    dateRange: [null, null] as [Date | null, Date | null],
  })

  const [filters, setFilters] = useState({
    selectedSubjects: [] as string[],
    groupFilter: "",
    dateRange: [null, null] as [Date | null, Date | null],
  })

  const [startDate, endDate] = filters.dateRange

  const changeTab = (tab: "current" | "archive") => {
    setActiveTab(tab)
    setPage(1)
  }

  const itemsPerPage = 9
  const location = useLocation()
  const subjects = location.state?.subjects || []

  const { data, isLoading, isError, refetch } = trpc.usos.getAcceptedExchanges.useQuery({
    page,
    itemsPerPage,
    subjects: filters.selectedSubjects,
    completed: activeTab === "archive",
    group: filters.groupFilter || null,
    startDate: startDate ? startDate.toISOString() : undefined,
    endDate: endDate ? endDate.toISOString() : undefined,
  })

  const markAsCompletedMutation = trpc.usos.markExchangeAsCompleted.useMutation()

  useEffect(() => {
    refetch()
  }, [activeTab, page, refetch])

  const handleMarkAsCompleted = async (exchangeId: string) => {
    await markAsCompletedMutation.mutateAsync({ exchangeId })
    refetch()
  }

  const handleFilterSubmit = () => {
    setFilters(formFilters)
    setPage(1)
    refetch()
  }

  if (isLoading) return <Loading />

  if (isError) {
    return <div className="text-center text-red-500 dark:text-red-300 p-4">{t("error_loading_accepted_exchanges")}</div>
  }

  const totalPages = data?.totalPages || 1

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">
        {t("Accepted Exchanges")}
      </h1>

      <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <label htmlFor="subjects" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("Select Subjects")}
            </label>
            <select
              id="subjects"
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 appearance-none"
              multiple={false}
              value={formFilters.selectedSubjects[0] || ""}
              onChange={(e) =>
                setFormFilters({
                  ...formFilters,
                  selectedSubjects: [e.target.value],
                })
              }
            >
              <option value="">{t("Select a subject")}</option>
              {subjects.map((subject: string) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 py-11 text-gray-700 dark:text-gray-300">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          <div>
            <label htmlFor="group" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("Filter by group")}
            </label>
            <input
              id="group"
              type="text"
              placeholder={t("Enter group")}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={formFilters.groupFilter}
              onChange={(e) =>
                setFormFilters({
                  ...formFilters,
                  groupFilter: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("Date Range")}
            </label>
            <DatePicker
              id="dateRange"
              selectsRange
              startDate={formFilters.dateRange[0]}
              endDate={formFilters.dateRange[1]}
              onChange={(update: [Date | null, Date | null]) => setFormFilters({ ...formFilters, dateRange: update })}
              isClearable={true}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
        </div>

        <button
          onClick={handleFilterSubmit}
          className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          {t("Apply Filters")}
        </button>
      </div>

      <div className="flex justify-center space-x-8 mb-6">
        <button
          onClick={() => changeTab("current")}
          className={`text-lg font-bold ${
            activeTab === "current"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          {t("Current")}
        </button>
        <button
          onClick={() => changeTab("archive")}
          className={`text-lg font-bold ${
            activeTab === "archive"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          {t("Archive")}
        </button>
      </div>

      {data?.exchanges.length > 0 ? (
        <div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data?.exchanges.map((exchange) => (
              <div
                key={exchange.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
                    {exchange.subjectName}
                  </h2>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {exchange.first_name1 + " " + exchange.last_name1}:
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {exchange.student1Id} ({t('From')}: {exchange.groupFrom1}, {t('To')}: {exchange.groupTo1})
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {exchange.first_name2 + " " + exchange.last_name2}:
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {exchange.student2Id} ({t('From')}: {exchange.groupFrom2}, {t('To')}: {exchange.groupTo2})
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                      <p>
                        {t("created")}: {new Date(exchange.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {activeTab === "current" && (
                    <button
                      onClick={() => handleMarkAsCompleted(exchange.id)}
                      className="mt-4 px-3 py-1 text-sm bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors duration-200 flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t("Mark as Completed")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
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
              onClick={() => setPage(page + 1)}
              className={`px-4 py-2 text-sm rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 ${
                page === totalPages ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              {t("next")}
            </button>
          </div>
        </div>
      ) : (
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-500 dark:text-green-300">
          {activeTab === "current"
            ? t("There are no accepted changes yet!")
            : t("There are no completed exchanges in the archive!")}
        </h2>
      )}
    </div>
  )
}

export default AcceptedExchangesPage

