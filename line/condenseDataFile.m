%% General Information
% This matlab function will condense the data file, so each year will only 
% have a single data point.  This will help test the javascript code with 
% real data before crossfilters are added to do this work inside of the
% webpage.

clear
clc
close all

T = readtable('cdp8_modifiedHeaders.xlsx');
T2 = sortrows(T, 'year');

%% Remove data points for years with only 1 data point.
years = unique(T2.year);
for j = 1:length(years)
    if sum(T2.year == years(j)) == 1
        T2(T2.year == years(j), :) = [];
    end
end



%% Computer sum of data for each year
T3 = T2;
T3(1:end, :) = [];

[len wid] = size(T2);
currentYear = 0;
T3length = 0;

for i = 1:len;
    if currentYear ~= T2.year(i)
        currentYear = T2.year(i);
        T3length = T3length + 1;
        T3(T3length, :) = T2(i, :);
    else
        T3.capacity_kW(T3length) = T3.capacity_kW(T3length) + T2.capacity_kW(i);
        T3.Cost_dollars(T3length) = T3.Cost_dollars(T3length) + T2.Cost_dollars(i);
        T3.Cost_dollars_with_incentive(T3length) = T3.Cost_dollars_with_incentive(T3length) + ...
            T2.Cost_dollars_with_incentive(i);
        
        T3.cost_per_kW_NI(T3length) = T3.Cost_dollars(T3length) / T3.capacity_kW(T3length);
        T3.cost_per_kW_Incentive(T3length) = T3.Cost_dollars_with_incentive(T3length) / T3.capacity_kW(T3length);
        
    end
end

T3

%% Generate Plot
plot(T3.year, T3.cost_per_kW_NI, 'r')
hold on
plot(T3.year, T3.cost_per_kW_Incentive, 'b')

%writetable(T3, 'cdp8_condensed.csv');

disp('Process Complete')