import React, { useMemo, useState } from "react";

import { AnalyticsPanels, EventBlockGrid } from "../DashboardSections.jsx";
import { TimelineRangeSelector } from "../shared/TimelineRangeControls.jsx";
import { buildMobileTimelineEntries, formatRangeSelection } from "../../lib/dashboard-helpers.js";
import { getTimelineText } from "../../../infra/i18n/timeline-locale.js";

function MobileDashboardView({
  activeDetail,
  categories,
  categoryDetail,
  chartAxisStroke,
  chartGridStroke,
  currentAggregate,
  currentKey,
  currentTimeline,
  data,
  locale,
  range,
  selectedCategoryId,
  selectedDate,
  selectedMonth,
  selectedSubcategoryId,
  selectedWeek,
  setRange,
  setSelectedDate,
  setSelectedMonth,
  setSelectedWeek,
  selectCategory,
  selectSubcategory,
  styledSubcategories,
}) {
  const [activeTab, setActiveTab] = useState("timeline");
  const timelineEntries = useMemo(() => buildMobileTimelineEntries(currentTimeline), [currentTimeline]);

  return (
    <main className="page page-mobile">
      <section className="mobile-shell">
        <header className="mobile-header">
          <div className="mobile-header-copy">
            <h1 className="mobile-title">Personal Timeline</h1>
          </div>
          <nav className="pill-group mobile-tab-group" aria-label={getTimelineText(locale, "selectTimeRange")}>
            <MobileTabButton active={activeTab === "timeline"} onClick={() => setActiveTab("timeline")}>
              Timeline
            </MobileTabButton>
            <MobileTabButton active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")}>
              Analytics
            </MobileTabButton>
            <MobileTabButton active={activeTab === "events"} onClick={() => setActiveTab("events")}>
              Events
            </MobileTabButton>
          </nav>
          <div className="mobile-range-row">
            <nav className="pill-group mobile-unit-group" aria-label={getTimelineText(locale, "selectTimeRange")}>
              <MobileTabButton active={range === "day"} onClick={() => setRange("day")}>
                {getTimelineText(locale, "day")}
              </MobileTabButton>
              <MobileTabButton active={range === "week"} onClick={() => setRange("week")}>
                {getTimelineText(locale, "week")}
              </MobileTabButton>
              <MobileTabButton active={range === "month"} onClick={() => setRange("month")}>
                {getTimelineText(locale, "month")}
              </MobileTabButton>
            </nav>
            <TimelineRangeSelector
              range={range}
              selectedDate={selectedDate}
              selectedWeek={selectedWeek}
              selectedMonth={selectedMonth}
              onDateChange={setSelectedDate}
              onWeekChange={setSelectedWeek}
              onMonthChange={setSelectedMonth}
              data={data}
              locale={locale}
            />
          </div>
        </header>
        <div className="mobile-content">
          {activeTab === "timeline" ? (
            <MobileTimelineView entries={timelineEntries} locale={locale} />
          ) : null}

          {activeTab === "analytics" ? (
            <AnalyticsPanels
              activeDetail={activeDetail}
              categories={categories}
              categoryDetail={categoryDetail}
              chartAxisStroke={chartAxisStroke}
              chartGridStroke={chartGridStroke}
              currentAggregate={currentAggregate}
              currentRangeLabel={formatRangeSelection(range, currentKey, locale) || getTimelineText(locale, "notSelected")}
              enablePcTargets={false}
              includeEvents={false}
              isCompact
              locale={locale}
              selectedCategoryId={selectedCategoryId}
              selectedSubcategoryId={selectedSubcategoryId}
              styledSubcategories={styledSubcategories}
              onCategorySelect={selectCategory}
              onSubcategorySelect={selectSubcategory}
            />
          ) : null}

          {activeTab === "events" ? (
            <MobileEventsView activeDetail={activeDetail} locale={locale} />
          ) : null}
        </div>
      </section>
    </main>
  );
}

function MobileTabButton({ active, children, onClick }) {
  return (
    <button type="button" className="pill mobile-tab" data-on={active} onClick={onClick}>
      {children}
    </button>
  );
}

function MobileTimelineView({ entries, locale }) {
  return (
    <section className="mobile-stack-section">
      {entries.length ? (
        <div className="mobile-timeline-list">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="mobile-timeline-card"
              style={{ "--mobile-item-fill": entry.color, "--mobile-item-ink": entry.ink }}
            >
              <div className="mobile-timeline-card-time">
                <span>{entry.dateText || getTimelineText(locale, "day")}</span>
                <strong>{entry.timeText}</strong>
              </div>
              <div className="mobile-timeline-card-body">
                <h2>{entry.title}</h2>
                <p>{entry.durationText}</p>
                {entry.note ? <div className="mobile-timeline-card-note">{entry.note}</div> : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="panel empty-state">{getTimelineText(locale, "noTimeline")}</div>
      )}
    </section>
  );
}

function MobileEventsView({ activeDetail, locale }) {
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <section className="mobile-stack-section">
      <div className="panel chart-panel event-panel">
        <div className="panel-header">
          <div className="panel-title-group">
            <h2>{getTimelineText(locale, "events")}</h2>
            {activeDetail ? (
              <span className="panel-context-pill" style={{ "--context-fill": activeDetail.color, "--context-ink": activeDetail.ink }}>
                {activeDetail.label}
              </span>
            ) : null}
          </div>
        </div>
        {activeDetail?.events?.length ? (
          <EventBlockGrid
            events={activeDetail.events}
            color={activeDetail.color}
            ink={activeDetail.ink}
            compact
            onEventSelect={setSelectedEvent}
          />
        ) : (
          <div className="empty-state small">{getTimelineText(locale, "noEventDetails")}</div>
        )}
      </div>
      {selectedEvent ? (
        <MobileEventDialog event={selectedEvent} ink={activeDetail?.ink || "var(--ink)"} onClose={() => setSelectedEvent(null)} />
      ) : null}
    </section>
  );
}

function MobileEventDialog({ event, ink, onClose }) {
  return (
    <div className="mobile-event-dialog-backdrop" onClick={onClose}>
      <div className="mobile-event-dialog" onClick={(eventObject) => eventObject.stopPropagation()}>
        <div className="mobile-event-dialog-header">
          <div>
            <h2 style={{ color: ink }}>{event.label}</h2>
            <span>{event.dateLabel ? `${event.dateLabel} | ` : ""}{event.timeLabel} | {event.compactDuration}</span>
          </div>
          <button type="button" className="mobile-event-dialog-close" onClick={onClose} aria-label="Close event details">
            ×
          </button>
        </div>
        <div className="mobile-event-dialog-body">
          <div>{event.fullLabel}</div>
          {event.note ? <p>{event.note}</p> : <p>{getTimelineText("en", "noData")}</p>}
        </div>
      </div>
    </div>
  );
}

export { MobileDashboardView };
