### license-check:    Check apisix-dashboard source code for Apache License
.PHONY: license-check
license-check:
ifeq ("$(wildcard .travis/openwhisk-utilities/scancode/scanCode.py)", "")
	git clone https://github.com/apache/openwhisk-utilities.git .travis/openwhisk-utilities
	cp .travis/ASF* .travis/openwhisk-utilities/scancode/
endif
	.travis/openwhisk-utilities/scancode/scanCode.py --config .travis/ASF-Release.cfg ./