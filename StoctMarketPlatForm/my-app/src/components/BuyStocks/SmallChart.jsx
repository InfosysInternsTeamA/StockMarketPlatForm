import axios from "axios";
import React from "react";
import { Chart } from "react-google-charts";

export default class SmallChart extends React.Component {
  state = {
    chartData: [],
    change: null,
    error: null,
  };

  componentDidMount() {
    this._isMounted = true;
    this.fetchChartDataWithRetry();
  }

  componentWillUnmount() {
    this._isMounted = false;
    if (this.controller) this.controller.abort();
  }

  fetchChartDataWithRetry = async (retryCount = 0) => {
    const maxRetries = 3;
    const suffix = this.props.exchange === "NSE" ? ".NS" : ".BO";
    const symbolWithSuffix = `${this.props.symbol}${suffix}`;
    this.controller = new AbortController();

    try {
      const res = await axios.get(`http://localhost:5000/api/stock/${symbolWithSuffix}`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json'
        },
        signal: this.controller.signal,
      });

      if (!this._isMounted) return;

      if (res.data.chart && res.data.chart.result && res.data.chart.result.length > 0) {
        const result = res.data.chart.result[0];
        const timestamps = result.timestamp;
        const values = result.indicators.quote[0].close;

        if (timestamps && values && values.length > 0) {
          const change = values[values.length - 1] / values[0];
          let chartData = [["Timestamp", "Price"]];
          timestamps.forEach((element, index) => {
            const date = new Date(element * 1000);
            chartData.push([date, values[index]]);
          });
          this.setState({ chartData, change, error: null });
        } else {
          this.setState({ error: "No data available for this symbol." });
        }
      } else {
        this.setState({ error: "No chart result available." });
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
      if (!this._isMounted) return;
      if (error.code === 'ECONNABORTED' && retryCount < maxRetries) {
        const delay = 1000 * Math.pow(2, retryCount);
        console.log(`Retrying... (${retryCount + 1}/${maxRetries}) after ${delay}ms`);
        setTimeout(() => {
          this.fetchChartDataWithRetry(retryCount + 1);
        }, delay); // Exponential backoff
      } else {
        let errorMessage = "Failed to fetch data.";
        if (error.code === 'ECONNABORTED') {
          errorMessage = "Request timed out. Please try again later.";
        }
        this.setState({ error: errorMessage });
      }
    }
  };

  render() {
    const divStyle = {
      borderBottom: "1px solid black",
      verticalAlign: "middle",
      paddingLeft: "2rem",
    };

    if (this.state.error) {
      return (
        <table>
          <tbody>
            <tr>
              <td colSpan="2" style={divStyle}>
                <h3>{this.props.symbol}: {this.state.error}</h3>
                <button onClick={() => this.fetchChartDataWithRetry()}>
                  Retry
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      );
    }

    if (this.state.chartData.length === 0) {
      return (
        <table>
          <tbody>
            <tr>
              <td colSpan="2" style={divStyle}>
                <h3>{this.props.symbol}: Loading...</h3>
              </td>
            </tr>
          </tbody>
        </table>
      );
    }

    const percentageChange = ((this.state.change - 1) * 100).toFixed(2);
    let color = "blue";
    if (this.state.change >= 1.01) color = "green";
    if (this.state.change <= 0.99) color = "red";

    const options = {
      legend: "none",
      hAxis: {
        baselineColor: "none",
        ticks: [],
        textPosition: "none",
      },
      vAxis: {
        baselineColor: "none",
        ticks: [],
        textPosition: "none",
      },
      colors: [color],
    };

    return (
      <table>
        <tbody>
          <tr>
            <td style={divStyle}>
              <h3>{this.props.symbol} {percentageChange}%</h3>
            </td>
            <td style={divStyle}>
              <Chart
                chartType="LineChart"
                data={this.state.chartData}
                width="100px"
                height="50px"
                options={options}
              />
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
}
