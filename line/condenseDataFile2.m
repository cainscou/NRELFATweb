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
for j = length(years):-1:1
    if sum(T2.year == years(j)) == 1
        T2(T2.year == years(j), :) = [];
        years(j) = [];
    end
end



%% Compute summary of data for each year.
T3 = T2;
T3(1:end - length(years), :) = [];

[len wid] = size(T2);


for i = 1:length(years);
    

    
    T3.year(i) = years(i);
    year_index = T2.year == years(i);
    T3.capacity_kW(i) = sum(T2.capacity_kW(year_index));
    T3.Cost_dollars(i) = sum(T2.Cost_dollars(year_index));
    T3.Cost_dollars_with_incentive(i) = sum(T2.Cost_dollars_with_incentive(year_index));
    T3.cost_per_kW_NI(i) = mean(T2.cost_per_kW_NI(year_index));
    T3.cost_per_kW_Incentive(i) = mean(T2.cost_per_kW_Incentive(year_index));

end

T3

%% Generate Plot
plot(T3.year, T3.cost_per_kW_NI, 'b')
hold on
plot(T3.year, T3.cost_per_kW_Incentive, 'r')
% axis([2003 2011 0 20000])

%% Export data
writetable(T3, 'cdp8_condensed.csv');


disp('Process Complete')