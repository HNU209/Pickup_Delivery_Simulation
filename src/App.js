import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useEffect, useState } from 'react';
import Slider from '@mui/material/Slider';
import axios, * as others from 'axios';
import Trip from './components/Trip';
import Splash from './components/Splash';
import './css/app.css';

const getTripData = time => {
  const res = axios.get(`https://raw.githubusercontent.com/HNU209/pickUp-delivery_Simulation/main/src/data/trip/trip_${time}.json`);
  // const res = axios.get(`./data/trip/trip_${time}.json`);
  const result = res.then(r => r.data);
  return result;
}

const getRestData = dataName => {
  const res = axios.get(`https://raw.githubusercontent.com/HNU209/pickUp-delivery_Simulation/main/src/data/rest/${dataName}.json`);
  // const res = axios.get(`./data/rest/${dataName}.json`);
  const result = res.then(r => r.data);
  return result;
}

const App = () => {
  const minTime = 1020;
  const maxTime = 1440;
  const initTripData = 1;

  const [time, setTime] = useState(minTime);
  const [data, setData] = useState({
    DRIVER_TRIP: [],
    DRIVER_POINT: [],
    ITEM_D_POINT: [],
    ITEM_O_POINT: [],
    check: [],
  });
  const [loaded, setLoaded] = useState(false);
  
  // init
  useEffect(() => {
    async function getFetchData() {
      const startTimeArray = [...Array(initTripData).keys()].map(t => t + minTime);
      const res = await Promise.all(startTimeArray.map(async i => {
        const DRIVER_TRIP_ = getTripData(i);
        return DRIVER_TRIP_;
      }));
      const DRIVER_POINT = await getRestData('driver_point');
      const ITEM_D_POINT = await getRestData('item_D_point');
      const ITEM_O_POINT = await getRestData('item_O_point');

      const TRIP_DATA = [];
      for (const data of res) {
        TRIP_DATA.push(...data);
      };
      
      if (TRIP_DATA && DRIVER_POINT && ITEM_D_POINT && ITEM_O_POINT) {
        setData(prev => ({
          ...prev,
          DRIVER_TRIP: [...data.DRIVER_TRIP, ...TRIP_DATA],
          DRIVER_POINT: [...data.DRIVER_POINT, ...DRIVER_POINT],
          ITEM_D_POINT: [...data.ITEM_D_POINT, ...ITEM_D_POINT],
          ITEM_O_POINT: [...data.ITEM_O_POINT, ...ITEM_O_POINT],
          check: [...data.check, ...startTimeArray]
        }));
        setLoaded(true);
      };
    };

    getFetchData();
  }, []);

  useEffect(() => {
    const requestTime = Math.floor(time) + initTripData;
    if (!(requestTime in data.check)) {
      async function getFetchData() {
        const res = await getTripData(requestTime);
        setData(prev => ({
          ...prev,
          DRIVER_TRIP: [...data.DRIVER_TRIP, ...res],
          check: [...data.check, requestTime]
        }))
      }
      getFetchData();
    }
  }, [Math.floor(time)]);

  const SliderChange = value => {
    const time = value.target.value;
    setTime(time);
  };

  return (
    <div className='container'>
      {
        loaded ?
        <>
          <Trip
            data={data}
            minTime={minTime}
            maxTime={maxTime}
            time={time}
            setTime={setTime}
          >
          </Trip>
          <Slider id="slider" value={time} min={minTime} max={maxTime} onChange={SliderChange} track="inverted"/>
        </>
        :
        <Splash />
      }
    </div>
  );
};

export default App;