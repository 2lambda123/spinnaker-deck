'use strict';

import { module } from 'angular';
import _ from 'lodash';

export const GOOGLE_AUTOSCALINGPOLICY_COMPONENTS_METRICSETTINGS_METRICSETTINGS_COMPONENT =
  'spinnaker.deck.gce.autoscalingPolicy.metricSettings.component';
export const name = GOOGLE_AUTOSCALINGPOLICY_COMPONENTS_METRICSETTINGS_METRICSETTINGS_COMPONENT; // for backwards compatibility
module(GOOGLE_AUTOSCALINGPOLICY_COMPONENTS_METRICSETTINGS_METRICSETTINGS_COMPONENT, []).component(
  'gceAutoscalingPolicyMetricSettings',
  {
    bindings: {
      policy: '=',
      showNoMetricsWarning: '=',
      updatePolicy: '<',
    },
    templateUrl: require('./metricSettings.component.html'),
    controller: function () {
      this.$onInit = () => {
        const multipleAllowedFor = {
          cpuUtilization: false,
          loadBalancingUtilization: false,
          customMetricUtilizations: true,
        };

        const metricTypes = Object.keys(multipleAllowedFor);

        this.targetTypesToDisplayMap = {
          GAUGE: 'Gauge',
          DELTA_PER_SECOND: 'Delta / second',
          DELTA_PER_MINUTE: 'Delta / minute',
        };

        this.metricScopeTypesToDisplayMap = {
          TIME_SERIES_PER_INSTANCE: 'Time series per instance',
          SINGLE_TIME_SERIES_PER_GROUP: 'Single time series per group',
        };

        this.scalingpolicyTypesToDisplayMap = {
          UTILIZATION_TARGET: 'Utilization target',
          SINGLE_INSTANCE_ASSIGNMENT: 'singleInstanceAssignment',
        };

        this.addMetric = (metricType) => {
          if (multipleAllowedFor[metricType]) {
            this.policy[metricType] = this.policy[metricType] || [];
            this.policy[metricType].push({});
          } else if (emptyOrUndefined(this.policy[metricType])) {
            this.policy[metricType] = { utilizationTarget: null };
          }
        };

        this.deleteMetric = (metricType, index) => {
          if (multipleAllowedFor[metricType]) {
            this.policy[metricType].splice(index, 1);
          } else {
            // sending an empty object to the API deletes the policy.
            this.policy[metricType] = {};
          }
        };

        this.showMetric = (metricType) => {
          const metric = this.policy[metricType];
          // should not show policy form if the policy is undefined or an empty object.
          return !emptyOrUndefined(metric);
        };

        this.isSingleTimeSeriesPerGroup = (scopeType, index) => {
          if (this.policy.customMetricUtilizations[index].metricExportScope === scopeType) return true;
        };

        this.isScalingPolicySingleInstanceAssignment = (policyType, index) => {
          if (this.policy.customMetricUtilizations[index].scalingpolicy === policyType) return true;
        };

        this.showNoMetricsWarning = () => {
          return _.every(
            metricTypes.map((type) => {
              return _.some([
                multipleAllowedFor[type] && !_.get(this.policy, [type, 'length']),
                emptyOrUndefined(this.policy[type]),
              ]);
            }),
          );
        };

        this.setUtilizationTargetFromDisplay = (metricType, value) => {
          this.policy[metricType].utilizationTarget = value / 100;
        };

        this.initializeTargetDisplay = (metricType) => {
          this[`${metricType}TargetDisplay`] = safeDecimalToPercent(this.policy[metricType].utilizationTarget);
        };

        function safeDecimalToPercent(value) {
          if (value === 0) {
            return 0;
          }
          return value ? Math.round(value * 100) : undefined;
        }

        function emptyOrUndefined(value) {
          return _.isEqual(value, {}) || _.isUndefined(value);
        }
      };
    },
  },
);
