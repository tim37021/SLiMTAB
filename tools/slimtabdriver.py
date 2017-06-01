#!/usr/bin/python3

import serial
import time
import struct

def list_com_ports():
	import serial.tools.list_ports
	return [x.device for x in serial.tools.list_ports.comports()]

class SliMTABDriver:
	def __init__(self, dev):
		self.dev = dev
		self.num_frets = 7
	
	def check(self):
		from sys import platform
		import os
		if platform == "linux" or platform == "linux2":
			return os.access(self.dev, os.W_OK | os.R_OK)
		return True
	
	def open(self):
		self.port = serial.Serial(dev, baudrate=9600)

	def close(self):
		self.port.close()

	def reset(self):
		self.port.write(b'\xAB')
		self.port.flush()

	def read(self):
		while True:
			ts = struct.unpack("<I", self.port.read(4))[0]/10
			l = struct.unpack("<B", self.port.read(1))[0]
			d = self.port.read(l)
			if self.port.read(1) == b'\xFF':
				ret = [0] * 6
				for dd in d:
					ret[dd//self.num_frets] = max(ret[dd//self.num_frets], dd%self.num_frets+1)
				return ts, l, ret
			
			while self.port.read(1) != b'\xFF':
				pass

	def begin(self):
		self.port.write(b'\xCD')
		self.port.flush()

	def end(self):
		self.port.write(b'\xEF')
		self.port.flush()
		

############################
import signal
import sys
exit_loop = False
def signal_handler(signal, frame):
	global exit_loop
	exit_loop = True
        
signal.signal(signal.SIGINT, signal_handler)
############################

if __name__ == '__main__':
	instance = SliMTABDriver("/dev/ttyUSB0")
	if not instance.check():
		print('You do not have permission to access device')
		sys.exit(1)
	instance.open()
	instance.reset()

	instance.begin()
	while not exit_loop:
		print(instance.read())
	instance.end()
	instance.close()
