import {ResponsivePie} from '@nivo/pie';
import {useEffect, useState} from "react";
import {auth} from "../config/firebase.tsx";
import {toast} from "react-toastify";
import {DefaultAlertTime} from "../config/globals.tsx";

type Expense = {
  id: string;
  category: string;
  creationDate: Date;
  description?: string;
  type: boolean;
  user: string;
  value: number;
}

function BasicPieChart({data}: { data: Array<Expense> }) {
  const [pieChartData, setPieChartData] = useState<number[]>([0, 0, 0, 0]);

  const categories = [
    {
      "id": "Jedzenie",
      "label": "Jedzenie",
      "value": pieChartData ? pieChartData[0] : 0,
      "color": "hsl(262, 70%, 50%)"
    },
    {
      "id": "Rozrywka",
      "label": "Rozrywka",
      "value": pieChartData ? pieChartData[1] : 0,
      "color": "hsl(100, 70%, 50%)"
    },
    {
      "id": "Transport",
      "label": "Transport",
      "value": pieChartData ? pieChartData[2] : 0,
      "color": "hsl(93, 70%, 50%)"
    },
    {
      "id": "Inne",
      "label": "Inne",
      "value": pieChartData ? pieChartData[3] : 0,
      "color": "hsl(314, 70%, 50%)"
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pieChartDataTemp: number[] = [0, 0, 0, 0];
        for (const item of data) {
          if (item.category === "Jedzenie") {
            pieChartDataTemp[0] += item.value;
          } else if (item.category === "Rozrywka") {
            pieChartDataTemp[1] += item.value;
          } else if (item.category === "Transport") {
            pieChartDataTemp[2] += item.value;
          } else {
            pieChartDataTemp[3] += item.value;
          }
          setPieChartData(pieChartDataTemp);
        }
      } catch (error) {
        console.error(error);
        toast.error('Nie udało się pobrać danych!', {
          position: "top-center",
          autoClose: DefaultAlertTime,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
    }

    fetchData().then();
  }, [data]);

  return (
    <div style={{height: "400px", width: "400px", zIndex: 1}}>
      <h5 style={{marginBottom: 0}}>Podsumowanie</h5>
      <ResponsivePie
        data={
          categories.filter((item) => item.value !== 0)
        }
        margin={{top: 40, right: 100, bottom: 80, left: 100}}
        tooltip={({datum}) => (
          <div style={{color: datum.color, padding: "3px 6px", borderRadius: "3px", backgroundColor: "#333333"}}>
            {datum.id}: {datum.value} zł
          </div>
        )}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{
          from: 'color',
          modifiers: [
            [
              'darker',
              0.2
            ]
          ]
        }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#FFFFFF"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{from: 'color'}}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
          from: 'color',
          modifiers: [
            [
              'darker',
              2
            ]
          ]
        }}
        defs={[
          {
            id: 'dots',
            type: 'patternDots',
            background: 'inherit',
            color: 'rgba(255, 255, 255, 0.3)',
            size: 4,
            padding: 1,
            stagger: true
          },
          {
            id: 'lines',
            type: 'patternLines',
            background: 'inherit',
            color: 'rgba(255, 255, 255, 0.3)',
            rotation: -45,
            lineWidth: 3,
            spacing: 10
          }
        ]}
        fill={[
          {
            match: {
              id: 'Jedzenie'
            },
            id: 'dots'
          },
          {
            match: {
              id: 'Rozrywka'
            },
            id: 'lines'
          },
          {
            match: {
              id: 'Transport'
            },
            id: 'dots'
          },
          {
            match: {
              id: 'Inne'
            },
            id: 'lines'
          },
        ]}
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 56,
            itemsSpacing: 0,
            itemWidth: 80,
            itemHeight: 18,
            itemTextColor: '#EEEEEE',
            itemDirection: 'left-to-right',
            itemOpacity: 1,
            symbolSize: 18,
            symbolShape: 'circle',
            effects: [
              {
                on: 'hover',
                style: {
                  itemTextColor: '#CCCCCC'
                }
              }
            ]
          }
        ]}
      />
    </div>
  )
}

export default BasicPieChart;
