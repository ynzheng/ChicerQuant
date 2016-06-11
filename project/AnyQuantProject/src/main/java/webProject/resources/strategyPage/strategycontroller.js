var app=angular.module("app",[]);




app.controller("strategycontroller",function($scope,$http){

  $scope.change=function(){
    var stockid=$scope.stockid;
    var nowDate=new Date();
    var year=nowDate.getFullYear();
    var month=nowDate.getMonth()+1;
    var day=nowDate.getDate();

    if (stockid==undefined) {
      stockid='sh600315';
      $scope.stockid='sh600315'
    }
    var startdate='startdate='+year+'-'+(month-2)+'-'+day;
    var enddate='enddate='+year+'-'+month+'-'+day;
    var name='name='+$scope.stockid;
    ER(name,startdate,enddate);
    NormalTest(name,startdate,enddate);
    Risk(name,startdate,enddate);
  };

  $scope.change();


  function Risk(name,startdate,enddate) {
    var url='http://localhost:8020/strategy/getRisk?';
    url=url+name+'&'+startdate+'&'+enddate;
    $http.get(url).success(function(response,status){
      var down=Number(response['downside']);
      down*=100;
      down=down.toFixed(2);
      var VaR=Number(response['VaR']);
      VaR*=100;
      VaR=VaR.toFixed(2);
      $scope.downside=down;
      $scope.VaR=VaR;
    });
  }

  function NormalTest(name,startdate,enddate) {
    var url='http://localhost:8020/strategy/getNormalTest?';
      url=url+name+'&'+startdate+'&'+enddate;
    $http.get(url).success(function(response,status){
      var average=Number(response['average']);
      average=average*100;
      average=average.toFixed(2);
      var varvalue=Number(response['var']);
      varvalue=varvalue*10000;
      varvalue=varvalue.toFixed(2);
      var p_value=Number(response['p']);
      p_value=p_value*100;
      p_value=p_value.toFixed(2);
      $scope.normal_p=p_value;
      $scope.average=average;
      $scope.varvalue=varvalue;
    }
    ).error(function() {
      alert('error');

    });
    var securl='http://localhost:8020/strategy/getQQ?';
    securl=securl+name+'&'+startdate+'&'+enddate;
    $http.get(securl).success(function(response,status){
      var point=[];
      for (obj in response) {
        var te=[];
        te.push(Number(response[obj]['x']));
        te.push(Number(response[obj]['y']));
        point.push(te);
      }
      qqopt={
        title : {
          text: $scope.stockid+" 正态分布检验Q-Q图",
          subtext: 'powered by chicer'
        },
        legend: {
          data: ['Q-Q点'],
          left: 'right'
        },
        tooltip : {
        trigger: 'axis',
        showDelay : 5,

        axisPointer:{
            show: true,
            type : 'cross',
            lineStyle: {
                type : 'dashed',
                width : 1
            }
        }
      },
        xAxis : [
        {
            type : 'value',
            scale:true,
            splitLine: {
                lineStyle: {
                    type: 'dashed'
                }
            }
        }
        ],
        yAxis : [
        {
            type : 'value',
            scale:true,
            splitLine: {
                lineStyle: {
                    type: 'dashed'
                }
            }
        }
        ],
        series:[
          {
            name:'Q-Q point',
            type:'scatter',
            data:point
          }
        ]
      };
      var chart=echarts.init(document.getElementById('Q_Q'));
      chart.setOption(qqopt);
    });
  }

  function ER(name,startdate,enddate) {

    var url='http://localhost:8020/strategy/getER?';

    url=url+name+'&'+startdate+'&'+enddate;
    $http.get(url).success(function(response,status){
      var date=[];
      var value=[];
      for (obj in response) {
        date.push(response[obj]['date']);
        var te=Number(response[obj]['er']);
        value.push(te.toFixed(2));
      }
    var option={
      title: {
          left: 'center',
          text: 'Earned Value Chart',
      },
      legend: {
          top: 'bottom',
          data:['Earned Value']
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          animation: true
        }
      },
      toolbox: {
          show: true,
          feature: {
              dataView: {show: true, readOnly: false},
              magicType: {show: true, type: ['line', 'bar', 'stack', 'tiled']},
              restore: {show: true},
              saveAsImage: {show: true}
          }
      },
      xAxis: {
          type: 'category',
          boundaryGap: false,
          data: date
      },
      yAxis: {
          type: 'value',
          boundaryGap: false,
          axisLabel: {
               formatter: function (val) {
                   return val + '%';
               }
           }
      },

      series: [
          {
              name:'Earned Value',
              type:'line',
              smooth:true,
              data: value,
              markPoint: {
                data: [
                    {type: 'max', name: '最大值'},
                    {type: 'min', name: '最小值'}
                ]
            },
            markLine: {
                data: [
                    {type: 'average', name: '平均值'}
                ]
            }
          }
      ]
    };
    var chart=echarts.init(document.getElementById('ER'));
    chart.setOption(option);

    }).error(function(){
      alert("error");
    });
  }

});
