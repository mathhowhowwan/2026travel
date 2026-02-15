import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 新增：地圖控制組件，負責置中移動
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
}

const initialData = {
  'Day 1': [
    { id: 'd1-1', name: '🏨 住宿：岡山車站周邊飯店', time: '15:00', lat: 34.6662, lng: 133.9185, transport: 'Taxi', travelTime: '15分鐘' },
    { id: 'd1-2', name: '🍴 用餐：岡山 AEON Mall 晚餐', time: '18:30', lat: 34.6635, lng: 133.9175, transport: 'Walk', travelTime: '' },
  ],
  'Day 2': [
    { id: 'd2-1', name: '岡山後樂園 (三大名園)', time: '09:30', lat: 34.6668, lng: 133.9352, transport: 'Taxi', travelTime: '10分鐘' },
    { id: 'd2-2', name: '🍴 用餐：後樂園周邊午餐', time: '12:00', lat: 34.6650, lng: 133.9310, transport: 'Walk', travelTime: '10分鐘' },
    { id: 'd2-3', name: '岡山城 (和服體驗)', time: '13:30', lat: 34.6652, lng: 133.9362, transport: 'Walk', travelTime: '' },
  ],
  'Day 3': [
    { id: 'd3-1', name: '倉敷美觀地區散策', time: '10:30', lat: 34.5960, lng: 133.7711, transport: 'Train', travelTime: '20分鐘' },
    { id: 'd3-2', name: '🍴 用餐：美觀地區古民家餐廳', time: '12:30', lat: 34.5965, lng: 133.7720, transport: 'Walk', travelTime: '10分鐘' },
    { id: 'd3-3', name: '🏨 住宿：倉敷地區飯店', time: '16:00', lat: 34.5950, lng: 133.7720, transport: 'Walk', travelTime: '' },
  ],
  'Day 4': [
    { id: 'd4-1', name: '兒島牛仔褲街', time: '10:30', lat: 34.4735, lng: 133.8015, transport: 'Charter', travelTime: '30分鐘' },
    { id: 'd4-2', name: '鷲羽山展望台 (看夕陽)', time: '16:00', lat: 34.4375, lng: 133.8125, transport: 'Charter', travelTime: '20分鐘' },
    { id: 'd4-3', name: '🍴 用餐：瀨戶內海鮮晚餐', time: '18:30', lat: 34.4400, lng: 133.8000, transport: 'Charter', travelTime: '' },
  ],
  'Day 5': [
    { id: 'd5-1', name: '吉備津神社 (長迴廊)', time: '10:00', lat: 34.6680, lng: 133.8510, transport: 'Charter', travelTime: '25分鐘' },
    { id: 'd5-2', name: '🍴 用餐：吉備路在地料理', time: '12:30', lat: 34.6700, lng: 133.8500, transport: 'Walk', travelTime: '30分鐘' },
    { id: 'd5-3', name: '岡山表町商店街採買', time: '15:30', lat: 34.6610, lng: 133.9290, transport: 'Taxi', travelTime: '' },
  ],
  'Day 6': [
    { id: 'd6-1', name: '岡山車站伴手禮採買', time: '10:00', lat: 34.6660, lng: 133.9180, transport: 'Walk', travelTime: '40分鐘' },
    { id: 'd6-2', name: '岡山機場 (返程)', time: '15:30', lat: 34.7570, lng: 133.8550, transport: 'Bus', travelTime: '' },
  ]
};

function App() {
  const [allDays, setAllDays] = useState(() => {
    const saved = localStorage.getItem('myTravelPlan_Final_v1');
    return saved ? JSON.parse(saved) : initialData;
  });
  const [activeDay, setActiveDay] = useState('Day 1');
  const [mapCenter, setMapCenter] = useState([34.66, 133.91]); // 控制地圖中心的狀態
  const items = allDays[activeDay] || [];

  useEffect(() => {
    localStorage.setItem('myTravelPlan_Final_v1', JSON.stringify(allDays));
  }, [allDays]);

  const exportData = () => {
    const dataStr = JSON.stringify(allDays, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `岡山行程_${new Date().toLocaleDateString()}.json`;
    link.click();
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (window.confirm("匯入會覆蓋現有行程，確定嗎？")) setAllDays(imported);
      } catch (err) { alert("檔案格式錯誤！"); }
    };
    reader.readAsText(file);
  };

  const addDay = () => {
    const nextDay = `Day ${Object.keys(allDays).length + 1}`;
    setAllDays({ ...allDays, [nextDay]: [] });
    setActiveDay(nextDay);
  };

  const deleteDay = () => {
    if (window.confirm(`確定要刪除整個 ${activeDay} 嗎？`)) {
      const newAllDays = { ...allDays };
      delete newAllDays[activeDay];
      setAllDays(newAllDays);
      setActiveDay(Object.keys(newAllDays)[0] || '');
    }
  };

  const addItem = () => {
    const name = prompt("請輸入景點名稱：", "🍴 用餐：");
    if (name) {
      const newItem = { id: Date.now().toString(), name, time: '12:00', lat: 34.66, lng: 133.91, transport: 'Walk', travelTime: '15分鐘' };
      setAllDays({ ...allDays, [activeDay]: [...items, newItem] });
    }
  };

  const handleMapClick = (latlng) => {
    const name = prompt("在地圖加入新景點名稱：", "🍴 用餐：");
    if (name) {
      const newItem = { id: Date.now().toString(), name, time: '12:00', lat: latlng.lat, lng: latlng.lng, transport: 'Walk', travelTime: '15分鐘' };
      setAllDays({ ...allDays, [activeDay]: [...items, newItem] });
    }
  };

  const getCardStyle = (item) => {
    let style = { padding: '15px', borderRadius: '12px', background: '#fff', borderLeft: '1px solid #e2e8f0', position: 'relative', marginBottom: '10px', cursor: 'pointer', transition: 'transform 0.2s' };
    if (item.name.includes('住宿')) { style.borderLeft = '6px solid #ed8936'; style.background = '#fffaf0'; }
    else if (item.name.includes('用餐') || item.name.includes('🍴')) { style.borderLeft = '6px solid #9f7aea'; style.background = '#faf5ff'; }
    else if (item.transport === 'Charter') { style.borderLeft = '6px solid #38a169'; style.background = '#f0fff4'; }
    return style;
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <div style={{ width: '420px', flexShrink: 0, padding: '20px', background: '#f8fafc', overflowY: 'auto', borderRight: '1px solid #e2e8f0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>🍑 15人慢活之旅</h2>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
          <button onClick={exportData} style={{ fontSize: '12px', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>📤 匯出</button>
          <label style={{ fontSize: '12px', padding: '5px 10px', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer' }}>
            📥 匯入 <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
          </label>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
          {Object.keys(allDays).sort().map(day => (
            <button key={day} onClick={() => setActiveDay(day)} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', backgroundColor: activeDay === day ? '#3182ce' : '#edf2f7', color: activeDay === day ? 'white' : '#4a5568', cursor: 'pointer', whiteSpace: 'nowrap' }}>{day}</button>
          ))}
          <button onClick={addDay} style={{ padding: '8px 15px', borderRadius: '50%', border: '1px dashed #cbd5e0', background: '#fff', cursor: 'pointer' }}>＋</button>
        </div>
        
        {activeDay && <button onClick={deleteDay} style={{ width: '100%', marginBottom: '15px', fontSize: '12px', color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer' }}>🗑 刪除此日期 ({activeDay})</button>}

        <DragDropContext onDragEnd={(res) => {
          if (!res.destination) return;
          const newItems = Array.from(items);
          const [reordered] = newItems.splice(res.source.index, 1);
          newItems.splice(res.destination.index, 0, reordered);
          setAllDays({ ...allDays, [activeDay]: newItems });
        }}>
          <Droppable droppableId="list">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {items.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <Draggable draggableId={item.id} index={index}>
                      {(p) => (
                        <div 
                          ref={p.innerRef} 
                          {...p.draggableProps} 
                          {...p.dragHandleProps} 
                          style={{ ...p.draggableProps.style, ...getCardStyle(item) }}
                          onClick={() => setMapCenter([item.lat, item.lng])} // 點擊卡片設定地圖中心
                        >
                          <button onClick={(e) => {
                             e.stopPropagation(); // 防止觸發置中事件
                             const n = [...items]; n.splice(index, 1); setAllDays({...allDays, [activeDay]: n});
                          }} style={{ position: 'absolute', right: '12px', top: '12px', border: 'none', background: 'none', cursor: 'pointer', color: '#cbd5e0' }}>🗑</button>
                          <div style={{ fontWeight: 'bold', fontSize: '17px' }}>{index + 1}. {item.name}</div>
                          <div style={{ fontSize: '13px', marginTop: '5px' }}>🕒 {item.time} | 🚌 {item.transport}</div>
                        </div>
                      )}
                    </Draggable>
                    {index < items.length - 1 && (
                      <div style={{ margin: '5px 0 5px 35px', borderLeft: '2px dashed #cbd5e0', paddingLeft: '20px', fontSize: '12px', color: '#718096' }}>🚗 移動：{item.travelTime || "15分鐘"}</div>
                    )}
                  </React.Fragment>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <button onClick={addItem} style={{ width: '100%', padding: '12px', marginTop: '15px', borderRadius: '10px', border: '2px dashed #3182ce', backgroundColor: '#ebf8ff', color: '#2b6cb0', cursor: 'pointer', fontWeight: 'bold' }}>+ 加入行程項目</button>
      </div>
      <div style={{ flexGrow: 1 }}>
        <MapContainer center={[34.66, 133.91]} zoom={13} style={{ height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapController center={mapCenter} /> {/* 地圖控制器 */}
          <MapClickHandler onMapClick={handleMapClick} />
          {items.map((item, idx) => (
            <Marker key={item.id} position={[item.lat, item.lng]}><Popup>{idx + 1}. {item.name}</Popup></Marker>
          ))}
          {items.length > 1 && <Polyline positions={items.map(i => [i.lat, i.lng])} color="#3182ce" dashArray="10, 10" />}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;