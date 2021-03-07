//#define DEBUG

#include <cstdio>
#include <iostream>
#include <unistd.h>
#include <memory>
#include <stdexcept>
#include <string>
#include <array>

bool isMaximized = true;

void MaximizeWindow()
{
	if (isMaximized)
		return;

	system("xdotool key alt+Tab");

	isMaximized = true;
}

void MinimizeWindow()
{
	if (!isMaximized)
		return;

	system("xdotool key alt+space");
	sleep(3);
	system("xdotool key n");

	isMaximized = false;
}

std::string exec(const char* cmd) {
	std::array<char, 128> buffer;
	std::string result;
	std::unique_ptr<FILE, decltype(&pclose)> pipe(popen(cmd, "r"), pclose);
	if (!pipe) {
		throw std::runtime_error("popen() failed!");
	}
	while (fgets(buffer.data(), buffer.size(), pipe.get()) != nullptr) {
		result += buffer.data();
	}

#ifdef DEBUG
	std::cout << "Exec result: " << result << std::endl;
#endif // DEBUG

	return result;
}

int main()
{
#ifdef DEBUG
	std::cout << "Started" << std::endl;
#endif // DEBUG

	while (1)
	{
		std::string result = exec("vcgencmd display_power");
		char hdmiState = result.at(result.size() - 2);

		if (hdmiState == '0')
		{
			MinimizeWindow();

#ifdef DEBUG
			std::cout << "Window minimized" << std::endl;
#endif // DEBUG

		}
		else if (hdmiState == '1')
		{
			MaximizeWindow();

#ifdef DEBUG
			std::cout << "Window maximized" << std::endl;
#endif // DEBUG

		}
		sleep(1);
	}

	return 0;
}