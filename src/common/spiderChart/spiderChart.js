import React, { Component } from 'react';
import spikeViewApiService from '../../common/core/api/apiService';
import CONSTANTS from '../../common/core/config/appConfig';

let Highcharts = window.Highcharts;

class spideChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      seriesData: [],
      competencyData: [],
      type: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    let userId = nextProps.userId;
    let sharedId = nextProps.sharedId;
    let type = nextProps.type;
    // if (nextProps.userId !== this.props.userId) {
    this.getChartData(userId, sharedId);
    this.setState({
      type
    });
    //}
  }

  componentDidMount() {
    console.log('Ff');
    let userId = this.props.userId;
    let sharedId = this.props.sharedId;
    let type = this.props.type;
    this.getChartData(userId, sharedId);
    this.setState({
      type
    });
  }

  getChartData = (userId, sharedId) => {    
    if(this.props.spiderChartVar && this.props.spiderChartVar >= 1) return false;

    let self = this;
    if (userId && sharedId) {
      spikeViewApiService('spiderGraph', { userId, sharedId })
        .then(response => {
          if (response.data.status === 'Success') {
            let chartData = response.data.result;
            this.setState({ chartData });
            let seriesData = [];
            let competencyData = [];
            let json = {};
            if (chartData.length > 0) {
              chartData.map((item, index) => {
                let competencyName = item.name + '- ' + item.importanceTitle;
                let competencyIcon =
                  "<div class='iconWrapper'><i class='" +
                  CONSTANTS.icons[item._id] +
                  ' ' +
                  'chartIcon' +
                  "'></i></div>";

                seriesData.push(item.importance);
                competencyData.push(item.name + '- ' + item.importanceTitle);
                json[competencyName] = competencyIcon;
              });

              self.plotSpiderChart(competencyData, seriesData, json);
            }
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  plotSpiderChart(competencyData, seriesData, json) {
    this.state.type === 'aerial'
      ? Highcharts.chart('container1', {
          chart: {
            polar: true,
            type: 'line',
            width: 300
          },

          title: {
            text: ''
          },

          pane: {
            size: '50%'
          },

          xAxis: {
            categories: competencyData,
            tickmarkPlacement: 'on',
            lineWidth: 0,
            labels: {
              useHTML: true,
              formatter: function() {
                return json[this.value];
              }
            }
          },

          yAxis: {
            min: 0,
            max: 10,
            tickInterval: 1,
            gridLineInterpolation: 'polygon',
            lineWidth: 0
          },

          tooltip: {
            shared: true,
            pointFormat: '<span style="color:{series.color}"><br/>'
          },

          exporting: {
            enabled: false
          },

          credits: {
            enabled: false
          },

          legend: {
            enabled: false
          },

          series: [
            {
              type: 'area',
              name: 'Importance',
              data: seriesData,
              pointPlacement: 'on'
            }
          ]
        })
      : Highcharts.chart('container1', {
          chart: {
            polar: true,
            type: 'line'
          },

          title: {
            text: ''
          },

          pane: {
            size: '60%'
          },

          xAxis: {
            categories: competencyData,
            tickmarkPlacement: 'on',
            lineWidth: 0,
            labels: {
              useHTML: true,
              formatter: function() {
                return json[this.value];
              }
            }
          },

          yAxis: {
            min: 0,
            max: 11,
            tickInterval: 1,
            gridLineInterpolation: 'polygon',
            lineWidth: 0
          },

          tooltip: {
            shared: true,
            pointFormat: '<span style="color:{series.color}"><br/>'
          },

          exporting: {
            enabled: false
          },

          credits: {
            enabled: false
          },

          legend: {
            enabled: false
          },

          series: [
            {
              type: 'area',
              name: 'Importance',
              data: seriesData,
              pointPlacement: 'on'
            }
          ]
        });
  }

  render() {
    return (
      <div
        id="container1"
        style={{ width: '100%', height: '300px', margin: '0 auto' }}
      />
    );
  }
}

export default spideChart;
