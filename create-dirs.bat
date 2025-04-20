@echo off
mkdir dist 2>nul
mkdir dist\icons 2>nul
mkdir dist\assets 2>nul
copy public\icons\*.* dist\icons\ 2>nul
copy public\*.* dist\ 2>nul
