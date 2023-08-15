import { useState } from 'react';
import {
  format,
  startOfMonth,
  startOfWeek,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  addMonths,
  subMonths,
  subDays,
  addDays,
} from 'date-fns';

const getDaysInView = (date: Date, viewMode: string) => {
  if (viewMode === 'month') {
    const firstDay = startOfMonth(date);
    const startDayOfWeek = firstDay.getDay();
    const lastDayOfPrevMonth = subDays(firstDay, 1);

    const daysFromPrevMonth = Array.from({ length: startDayOfWeek })
      .map((_, i) => subDays(lastDayOfPrevMonth, i))
      .reverse();

    const daysInCurrentMonth = eachDayOfInterval({
      start: firstDay,
      end: endOfMonth(date),
    });

    return [...daysFromPrevMonth, ...daysInCurrentMonth];
  } else {
    const start = startOfWeek(date);
    return eachDayOfInterval({ start, end: addDays(start, 6) });
  }
};

const navigateCalendar = (currentDate: Date, viewMode: string, direction: string) => {
  if (viewMode === 'month') {
    return direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1);
  } else {
    return direction === 'prev' ? subDays(currentDate, 7) : addDays(currentDate, 7);
  }
};

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [events, setEvents] = useState<{ title: string; date: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [editingEventIndex, setEditingEventIndex] = useState<number | null>(null);

  const daysInView = getDaysInView(currentDate, viewMode);
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  const openModalForEvent = (date: string, eventIndex: number | null = null, title = '') => {
    setSelectedDate(date);
    setEditingEventIndex(eventIndex);
    setEventTitle(title);
    setIsModalOpen(true);
  };

  return (
    <main className="flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-6 text-orange-500">Next.jsでカレンダーアプリ</h1>
      <div className="mb-4">
        <button
          onClick={() => setViewMode('week')}
          className={`mr-2 px-4 py-2 rounded ${
            viewMode === 'week' ? 'bg-orange-600 text-white' : 'bg-gray-300'
          }`}
        >
          Week
        </button>
        <button
          onClick={() => setViewMode('month')}
          className={`px-4 py-2 rounded ${
            viewMode === 'month' ? 'bg-orange-500 text-white' : 'bg-gray-200'
          }`}
        >
          Month
        </button>
      </div>
      <div className="mb-2">
        <button
          onClick={() => setCurrentDate((prevDate) => navigateCalendar(prevDate, viewMode, 'prev'))}
          className="mr-2 px-4 py-2 rounded hover:bg-gray-200"
        >
          prev
        </button>
        <button
          onClick={() => setCurrentDate(new Date())}
          className="mr-2 px-4 py-2 font-bold rounded hover:bg-gray-200"
        >
          today
        </button>
        <button
          onClick={() => setCurrentDate((prevDate) => navigateCalendar(prevDate, viewMode, 'next'))}
          className="px-4 py-2 rounded hover:bg-gray-200"
        >
          next
        </button>
      </div>
      <div className="bg-orange-200 rounded p-4 text-center">
        <p className="text-xl font-bold pb-4">{format(currentDate, 'yyyy年 MM月')}</p>
        <div className="grid grid-cols-7 gap-4 ">
          {dayNames.map((name) => (
            <div className="text-center p-2 font-bold" key={name}>
              {name}
            </div>
          ))}
          {daysInView.map((day) => (
            <div
              key={day.toString()}
              className={`text-center p-2 rounded bg-white max-w-[6rem] ${
                isToday(day) && 'border-2 border-blue-500'
              } ${day.getMonth() !== currentDate.getMonth() ? 'text-gray-400' : ''}`}
            >
              <span className="mr-6 font-bold">{format(day, 'd')}</span>
              <span
                className="text-xs p-2 text-orange-400 cursor-pointer hover:bg-orange-100 px-1 rounded"
                onClick={() => openModalForEvent(format(day, 'yyyy-MM-dd'))}
              >
                add
              </span>
              <div className={`mt-1 w-20 ${viewMode === 'week' ? 'h-40' : 'h-12'} overflow-auto`}>
                {events
                  .filter((event) => event.date === format(day, 'yyyy-MM-dd'))
                  .map((event) => (
                    <div
                      key={event.title}
                      className="text-xs bg-green-200 rounded text-left p-1 mt-1 cursor-pointer hover:bg-green-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        const index = events.findIndex((ev) => ev === event);
                        openModalForEvent(
                          format(day, 'yyyy-MM-dd'),
                          index !== -1 ? index : null,
                          event.title
                        );
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingEventIndex(null);
              }}
              className="absolute top-2 right-4 text-xl hover:bg-gray-200 rounded px-2"
            >
              &times;
            </button>
            <h2 className="mb-2">
              {editingEventIndex === null ? '新しい予定を追加' : '予定を編集'}
            </h2>
            <input
              type="date"
              value={selectedDate || ''}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border p-2 rounded w-full mb-2"
            />
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="予定のタイトル"
              className="border p-2 rounded w-full mb-2"
            />
            {editingEventIndex === null ? (
              <button
                onClick={() => {
                  if (eventTitle.trim() === '' || selectedDate === null) {
                    alert('日付とタイトルを入力してください');
                  } else {
                    setEvents([...events, { title: eventTitle, date: selectedDate }]);
                    setIsModalOpen(false);
                    setEventTitle('');
                  }
                }}
                className="bg-orange-500 text-white px-4 py-2 rounded"
              >
                保存
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    if (eventTitle.trim() !== '' && editingEventIndex !== null && selectedDate) {
                      const updatedEvents = [...events];
                      updatedEvents[editingEventIndex].title = eventTitle;
                      updatedEvents[editingEventIndex].date = selectedDate;
                      setEvents(updatedEvents);
                      setIsModalOpen(false);
                      setEventTitle('');
                    }
                  }}
                  className="bg-orange-500 text-white px-4 py-2 rounded mr-2"
                >
                  更新
                </button>
                <button
                  onClick={() => {
                    if (editingEventIndex !== null) {
                      const updatedEvents = [...events];
                      updatedEvents.splice(editingEventIndex, 1);
                      setEvents(updatedEvents);
                      setIsModalOpen(false);
                      setEventTitle('');
                    }
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  削除
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
