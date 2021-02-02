/*
* MIT License

* Copyright (c) 2019 Alipay.inc

* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:

* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.

* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/
/* eslint-disable */
!(function (l) {
  var c,
    h,
    t,
    a,
    i,
    e,
    z =
      '<svg><symbol id="iconinfocircle"viewBox="64 64 896 896" focusable="false"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" /><path d="M464 336a48 48 0 1096 0 48 48 0 10-96 0zm72 112h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V456c0-4.4-3.6-8-8-8z" /></symbol><symbol id="icondashboard" viewBox="0 0 1024 1024"><path d="M662.87 343.467l60.33 60.33-128.768 128.768a85.333 85.333 0 1 1-60.33-60.33l128.767-128.768zM85.332 512C85.333 276.352 276.352 85.333 512 85.333S938.667 276.352 938.667 512a425.813 425.813 0 0 1-156.758 330.453l-70.826-53.162a341.333 341.333 0 1 0-398.123 0l-70.87 53.162A425.813 425.813 0 0 1 85.334 512zM384 725.333h256v85.334H384v-85.334z"  ></path></symbol><symbol id="iconssl" viewBox="0 0 1024 1024"><path d="M167.1 99.1v825h684.6v-825H167.1z m653.5 790.8H198.2V133.3h622.4v756.6zM704 496.7c-2.2-3.3-2.1-2.9-7.9-9.2-2.8-3.1-5.8-5.7-9.2-8-83.6-54.1-171.5 4.6-171.5 83.8 0 17.4 4.2 33.8 11.7 48.2l-76 151.6 69.8-7.6 35.7 60.4 62.1-124 71 123.7 32.2-62.3L792 757l-81.1-141.5c18.8-32.6 20.6-76.2-6.9-118.8zM554.9 766.4l-21.3-36.1-41.7 4.5 50.7-101.2c15.8 17.4 37.4 29.5 61.8 33.2l0.3 0.5-49.8 99.1z m7.9-145.9c-15.3-15.3-23.7-35.7-23.7-57.3 0-21.6 8.4-42 23.7-57.3 15.3-15.3 35.7-23.7 57.3-23.7s42 8.4 57.3 23.7 23.7 35.7 23.7 57.3c0 21.6-8.4 42-23.7 57.3-15.3 15.3-35.7 23.7-57.3 23.7s-42-8.3-57.3-23.7z m187.1 110.6l-41.9-2.2-19.3 37.3-56.7-98.9c24.8-2.8 47-14.2 63.4-31.2l54.5 95z m30.7-573.2H238.2V174h542.4v-16.1z m-73.9 129.8H279.2v32.5h427.6v-32.5zM279.2 430h244.9v-32.5H279.2V430z m0 109.8h183.7v-32.5H279.2v32.5z m340.9-45.4v16.3c29 0 52.6 23.6 52.6 52.6s-23.6 52.6-52.6 52.6v16.3c38 0 68.8-30.9 68.8-68.9 0.1-38-30.8-68.9-68.8-68.9z"  ></path></symbol><symbol id="iconroute" viewBox="0 0 1024 1024"><path d="M786.6 168.7h-74.4v14.9h74.4v-14.9z m-163.7-44.6H399.7v29.8h223.2v-29.8z m-312.4 44.6h-74.4v14.9h74.4v-14.9zM370 94.3h-29.8v89.3H370V94.3z m342.2 29.8v29.8h89.3V868H221.2V153.8h89.3V124h-119v773.7h639.8V124.1H712.2z m-29.8-29.8h-29.8v89.3h29.8V94.3z m-59.5 74.4H399.7v14.9h223.2v-14.9zM336.2 449.2c13 0 24.2-8 28.8-19.4h55.2l105.3-65.4h80.6c4 12.5 15.8 21.6 29.6 21.6 17.2 0 31.1-13.9 31.1-31.1s-13.9-31.1-31.1-31.1c-12.2 0-22.7 7-27.8 17.2h-89.1l-105.3 65.4H365c-4.6-11.4-15.8-19.4-28.8-19.4-17.2 0-31.1 13.9-31.1 31.1s14 31.1 31.1 31.1z m0 87.1c14.1 0 26.1-9.4 29.8-22.4h141.7c4.6 11.4 15.8 19.4 28.8 19.4 17.2 0 31.1-13.9 31.1-31.1s-13.9-31.1-31.1-31.1c-13 0-24.2 8-28.8 19.4H363.6c-5.2-9.8-15.6-16.4-27.4-16.4-17.2 0-31.1 13.9-31.1 31.1s14 31.1 31.1 31.1z m0 100.2c13.7 0 25.3-8.8 29.4-21.1h97.1l109.4 66.1h37.2c5 10.4 15.7 17.6 28 17.6 17.2 0 31.1-13.9 31.1-31.1s-13.9-31.1-31.1-31.1c-13.7 0-25.3 8.9-29.5 21.2h-29.2L469.3 592h-105c-5-10.5-15.7-17.7-28.1-17.7-17.2 0-31.1 13.9-31.1 31.1s14 31.1 31.1 31.1z"  ></path></symbol><symbol id="iconserver" viewBox="0 0 1024 1024"><path d="M600.678 904.431H868.94c19.929 0 33.725 13.797 33.725 30.659s-13.796 30.659-33.725 30.659H600.678c4.599-9.198 7.665-19.929 7.665-30.66s-3.066-19.927-7.665-30.658z m-93.51-45.988c41.39 0 76.648 35.258 76.648 76.647s-35.258 76.647-76.647 76.647-76.647-35.258-76.647-76.647 35.258-76.647 76.647-76.647z m-30.658-15.33h61.318v-61.317H476.51v61.318z m-334.18 61.318h272.863c-4.599 9.198-7.665 19.928-7.665 30.659s3.066 21.46 7.665 30.659H142.33c-19.929 0-33.725-13.797-33.725-30.66s15.33-30.658 33.725-30.658z m610.108-766.467h61.318V76.647h-61.318v61.317z m-76.646-61.317c-16.863 0-30.659 13.796-30.659 30.658s13.796 30.66 30.659 30.66 30.658-13.797 30.658-30.66-13.796-30.658-30.658-30.658z m-107.306 0c-16.862 0-30.658 13.796-30.658 30.658s13.796 30.66 30.658 30.66 30.659-13.797 30.659-30.66-13.796-30.658-30.659-30.658zM859.744 214.61h-705.15c-24.527 0-45.988-19.928-45.988-47.521V49.054c0-24.527 19.928-47.521 45.988-47.521h705.15c24.527 0 45.988 19.928 45.988 47.52V167.09c0 27.593-21.461 47.52-45.988 47.52zM752.438 413.892h61.318v-61.317h-61.318v61.317z m-76.646-61.317c-16.863 0-30.659 13.796-30.659 30.659s13.796 30.658 30.659 30.658 30.658-13.796 30.658-30.658c0-15.33-13.796-30.66-30.658-30.66z m-107.306 0c-16.862 0-30.658 13.796-30.658 30.659s13.796 30.658 30.658 30.658 30.659-13.796 30.659-30.658c1.533-15.33-13.796-30.66-30.659-30.66z m291.258 137.964h-705.15c-24.527 0-45.988-19.928-45.988-47.521V324.982c0-24.527 19.928-47.52 45.988-47.52h705.15c24.527 0 45.988 19.927 45.988 47.52v118.036c0 27.593-21.461 47.52-45.988 47.52zM752.438 689.82h61.318v-61.317h-61.318v61.317z m-76.646-61.317c-16.863 0-30.659 13.796-30.659 30.659s13.796 30.658 30.659 30.658 30.658-13.796 30.658-30.658-13.796-30.659-30.658-30.659z m-107.306 0c-16.862 0-30.658 13.796-30.658 30.659s13.796 30.658 30.658 30.658 30.659-13.796 30.659-30.658c1.533-16.863-13.796-30.659-30.659-30.659z m291.258 137.964h-705.15c-24.527 0-45.988-19.928-45.988-47.52V600.91c0-24.527 19.928-47.52 45.988-47.52h705.15c24.527 0 45.988 19.927 45.988 47.52v118.036c0 24.527-21.461 47.521-45.988 47.521z"  ></path></symbol><symbol id="iconsetting" viewBox="0 0 1024 1024"><path d="M512 362.73A149.27 149.27 0 1 0 661.27 512 149.44 149.44 0 0 0 512 362.73z m0 255.894A106.624 106.624 0 1 1 618.624 512 106.752 106.752 0 0 1 512 618.624z"  ></path><path d="M858.09 554.603a53.867 53.867 0 0 1 0-85.206 96.448 96.448 0 0 0-71.231-172.01 53.824 53.824 0 0 1-60.246-60.246 96.448 96.448 0 0 0-172.01-71.253 55.51 55.51 0 0 1-85.206 0 96.448 96.448 0 0 0-172.01 71.253 53.824 53.824 0 0 1-60.246 60.246 96.448 96.448 0 0 0-71.253 172.01 53.867 53.867 0 0 1 0 85.206 96.448 96.448 0 0 0 71.253 172.01 53.824 53.824 0 0 1 60.246 60.246 94.336 94.336 0 0 0 58.773 101.397A99.605 99.605 0 0 0 394.24 896a94.357 94.357 0 0 0 75.157-37.91 55.51 55.51 0 0 1 85.206 0 96.448 96.448 0 0 0 172.01-71.253 53.824 53.824 0 0 1 60.246-60.224 96.448 96.448 0 0 0 71.253-172.01z m-9.258 96.917a52.31 52.31 0 0 1-56.555 32.768 96.512 96.512 0 0 0-107.968 107.99A53.824 53.824 0 0 1 588.352 832a99.413 99.413 0 0 0-152.683 0 53.824 53.824 0 0 1-95.957-39.744 96.533 96.533 0 0 0-95.51-108.779 100.885 100.885 0 0 0-12.48 0.79A53.824 53.824 0 0 1 192 588.33a96.49 96.49 0 0 0 0-152.683 53.824 53.824 0 0 1 39.744-95.957 96.512 96.512 0 0 0 107.968-107.947 53.824 53.824 0 0 1 95.979-39.765 99.413 99.413 0 0 0 152.682 0 53.824 53.824 0 0 1 95.958 39.744A96.512 96.512 0 0 0 792.277 339.69a53.824 53.824 0 0 1 39.766 95.957 96.49 96.49 0 0 0 0 152.683 52.053 52.053 0 0 1 16.81 63.189z"  ></path></symbol><symbol id="iconconsumer" viewBox="0 0 1070 1024"><path d="M951.216 883.451c-10.04 0-18.824-8.784-18.824-18.824 0-112.94-62.745-214.588-163.137-267.294-5.02-2.51-8.784-7.53-10.04-13.804s1.256-12.549 6.275-16.313c40.157-37.647 61.49-87.843 61.49-143.06 0-107.92-87.843-195.764-195.764-195.764S435.45 316.235 435.45 424.157c0 53.96 22.588 105.412 61.49 143.059 5.02 3.764 6.275 10.039 6.275 16.313s-5.02 11.295-10.04 13.804C392.784 650.04 330.04 751.686 330.04 864.627c0 10.04-8.784 18.824-18.823 18.824s-18.824-8.784-18.824-18.824c0-119.215 61.49-227.137 161.883-288.627-36.393-42.667-56.471-95.373-56.471-151.843 0-129.255 105.412-233.412 233.412-233.412s233.411 105.412 233.411 233.412c0 56.47-20.078 109.176-56.47 151.843 100.392 61.49 161.882 169.412 161.882 288.627 0 11.295-8.784 18.824-18.823 18.824zM120.47 833.255c-10.04 0-18.824-8.784-18.824-18.824 0-119.215 61.49-227.137 161.882-288.627-36.392-42.667-56.47-95.373-56.47-151.843 0-129.255 105.412-233.412 233.412-233.412 10.039 0 18.823 8.784 18.823 18.824s-8.784 18.823-18.823 18.823c-107.922 0-195.765 87.843-195.765 195.765 0 53.96 22.588 105.412 61.49 143.059 5.02 3.764 6.275 10.039 6.275 16.313s-5.02 11.294-10.04 13.804C202.04 599.843 139.294 701.49 139.294 814.431c0 10.04-8.784 18.824-18.823 18.824z"  ></path><path d="M951.216 883.451c-10.04 0-18.824-8.784-18.824-18.824 0-112.94-62.745-214.588-163.137-267.294-5.02-2.51-8.784-7.53-10.04-13.804s1.256-12.549 6.275-16.313c40.157-37.647 61.49-87.843 61.49-143.06 0-107.92-87.843-195.764-195.764-195.764S435.45 316.235 435.45 424.157c0 53.96 22.588 105.412 61.49 143.059 5.02 3.764 6.275 10.039 6.275 16.313s-5.02 11.295-10.04 13.804C392.784 650.04 330.04 751.686 330.04 864.627c0 10.04-8.784 18.824-18.823 18.824s-18.824-8.784-18.824-18.824c0-119.215 61.49-227.137 161.883-288.627-36.393-42.667-56.471-95.373-56.471-151.843 0-129.255 105.412-233.412 233.412-233.412s233.411 105.412 233.411 233.412c0 56.47-20.078 109.176-56.47 151.843 100.392 61.49 161.882 169.412 161.882 288.627 0 11.295-8.784 18.824-18.823 18.824z"  ></path></symbol><symbol id="iconjwt-3" viewBox="0 0 1024 1024"><path d="M589.312 275.456L588.288 0h-153.6l1.024 275.456 76.8 105.472z m-153.6 472.064v276.48h153.6v-276.48L512.512 642.048z" fill="#FFFFFF" ></path><path d="M589.312 747.52l161.792 223.232 123.904-90.112-161.792-223.232-123.904-39.936z m-153.6-472.064L272.896 52.224l-123.904 90.112L310.784 365.568l124.928 39.936z" fill="#00F2E6" ></path><path d="M310.784 365.568L48.64 280.576 1.536 425.984 263.68 512l123.904-40.96z m325.632 186.368l76.8 105.472 262.144 84.992 47.104-145.408-262.144-84.992z" fill="#00B9F1" ></path><path d="M760.32 512l262.144-86.016-47.104-145.408L713.216 365.568l-76.8 105.472z m-496.64 0L1.536 596.992 48.64 742.4l262.144-84.992 76.8-105.472z" fill="#D63AFF" ></path><path d="M310.784 657.408L148.992 880.64l123.904 90.112 162.816-223.232V617.472zM713.216 365.568l161.792-223.232-123.904-90.112-161.792 223.232v130.048z" fill="#FB015B" ></path></symbol><symbol id="iconkeycloak_icon_32px" viewBox="0 0 1029 1024"><path d="M876.8 304a7.68 7.68 0 0 1-6.72-3.84l-115.52-200.32a7.68 7.68 0 0 0-6.72-3.84H276.48a7.68 7.68 0 0 0-6.72 3.84l-119.68 208-115.84 200.32a7.68 7.68 0 0 0 0 7.68l115.52 200.32 120 208a7.68 7.68 0 0 0 6.72 3.84h471.36a7.68 7.68 0 0 0 6.72-3.84l115.52-200.32a7.68 7.68 0 0 1 6.72-3.84h144a8.64 8.64 0 0 0 8.64-8.64V312.64a8.64 8.64 0 0 0-8.64-8.64h-144z" fill="#4D4D4D" ></path><path d="M176 490.88l-128 46.72-12.8-22.08a7.68 7.68 0 0 1 0-7.68l58.56-101.12z" fill="#E1E1E1" ></path><path d="M944.32 528.32l85.12-12.16v98.88l-85.12-86.72z" fill="#C8C8C8" ></path><path d="M944.32 528.32l85.12 86.4v96a8.64 8.64 0 0 1-8.64 8.64H921.92z" fill="#C2C2C2" ></path><path d="M944.32 528.32l-22.4 191.68h-119.04l-36.16-87.04 177.6-104.64z" fill="#C7C7C7" ></path><path d="M944.32 528.32l85.12-103.68v91.52l-85.12 12.16z" fill="#CECECE" ></path><path d="M1029.44 312.64v112l-85.12 103.68-64-224h140.8a8.64 8.64 0 0 1 8.32 8.32z" fill="#D3D3D3" ></path><path d="M802.88 720h-63.04l-16-23.36 42.88-63.68 36.16 87.04z" fill="#C6C6C6" ></path><path d="M944.32 528.32l-235.52-99.52 123.84-124.8h47.36l64.32 224.32z" fill="#D5D5D5" ></path><path d="M708.8 428.8l57.92 204.16 177.6-104.64z" fill="#D0D0D0" ></path><path d="M739.84 720h-16.96l0.96-23.36 16 23.36z" fill="#BFBFBF" ></path><path d="M832.64 304l-123.84 124.8-22.4-111.68 47.68-13.12h98.56z" fill="#D9D9D9" ></path><path d="M708.8 428.8l-286.08 65.92 300.8 201.92z" fill="#D4D4D4" ></path><path d="M708.8 428.8l15.04 267.84 42.88-64z" fill="#D0D0D0" ></path><path d="M686.4 317.12l-263.68 177.6 285.76-65.92z" fill="#D9D9D9" ></path><path d="M422.72 494.72L298.88 720H228.16l-52.16-229.12 246.72 3.84z" fill="#D8D8D8" ></path><path d="M295.68 304l-119.68 186.88-32-175.68 4.16-7.36a7.68 7.68 0 0 1 8.32-3.84h139.2z" fill="#E2E2E2" ></path><path d="M228.16 720H156.48a7.68 7.68 0 0 1-6.72-3.84l-102.72-178.24 128-46.72z" fill="#D8D8D8" ></path><path d="M176 490.88l-83.2-84.16 52.8-91.52 30.4 175.68z" fill="#E4E4E4" ></path><path d="M553.6 304h-208.96l78.08 190.72 263.68-177.6-79.36-13.12h-53.44z" fill="#DEDEDE" ></path><path d="M312 304h-16.32l-119.68 186.88 246.72 3.84-78.08-190.72H312z" fill="#DEDEDE" ></path><path d="M666.24 720h56.64l0.96-23.36-57.6 23.36z" fill="#C5C5C5" ></path><path d="M723.84 696.64l-301.12-201.92 54.4 225.28h189.12l57.6-23.36z" fill="#D0D0D0" ></path><path d="M298.88 720h178.24l-54.4-225.28-123.84 225.28z" fill="#D1D1D1" ></path><path d="M687.04 304l-0.64 13.12 47.68-13.12H687.04z" fill="#DDDDDD" ></path><path d="M607.04 304l79.36 13.12-7.36-13.12h-72z" fill="#E3E3E3" ></path><path d="M679.04 304l7.36 13.12 0.64-13.12h-8z" fill="#E2E2E2" ></path><path d="M470.08 307.52l-116.16 201.28a6.72 6.72 0 0 0 0 3.2H272l160-276.48a6.4 6.4 0 0 1 2.24 2.24l36.16 64a7.04 7.04 0 0 1-0.32 5.76z" fill="#00B8E3" ></path><path d="M470.08 723.84l-36.16 64a7.04 7.04 0 0 1-2.56 2.24L272 512H352.32a6.08 6.08 0 0 0 0 3.2l116.16 201.28a6.72 6.72 0 0 1 1.6 7.36z" fill="#33C6E9" ></path><path d="M431.36 235.84L272 512l-40 69.44L192.32 515.2a6.08 6.08 0 0 1 0-3.2 6.72 6.72 0 0 1 0-3.2l38.72-66.88 117.44-203.52a6.72 6.72 0 0 1 6.08-3.52h72z" fill="#008AAA" ></path><path d="M431.36 788.48h-75.52a6.72 6.72 0 0 1-6.08-3.52l-107.2-184.96-10.56-18.56L272 512z" fill="#00B8E3" ></path><path d="M752.32 512l-160 276.48a7.36 7.36 0 0 1-2.24-2.24l-36.16-64a7.04 7.04 0 0 1 0-6.4l116.16-201.28A6.72 6.72 0 0 0 672.32 512h80z" fill="#008AAA" ></path><path d="M832.32 512a6.72 6.72 0 0 1 0 3.52l-156.16 270.72a6.72 6.72 0 0 1-5.76 3.2h-74.24a7.36 7.36 0 0 1-3.52 0l160-276.48 40-69.12 38.08 65.92A6.72 6.72 0 0 1 832.32 512zM752.32 512H672.32a6.72 6.72 0 0 0 0-3.52l-118.08-200.96a6.72 6.72 0 0 1 0-7.04l36.16-64a7.36 7.36 0 0 1 2.24-2.24z" fill="#00B8E3" ></path><path d="M792.32 442.88L752.32 512l-160-276.48a7.36 7.36 0 0 1 3.52 0h72a6.72 6.72 0 0 1 5.76 3.2z" fill="#33C6E9" ></path></symbol><symbol id="iconApache_kafka" viewBox="0 0 1024 1024"><path d="M693.691077 566.685538c-39.842462 0-75.561846 17.651692-100.022154 45.442462l-62.678154-44.371692c6.653538-18.318769 10.473846-37.988923 10.473846-58.577231 0-20.231385-3.687385-39.571692-10.121846-57.619692l62.537846-43.901539c24.457846 27.650462 60.083692 45.206154 99.810462 45.206154 73.538462 0 133.376-59.827692 133.376-133.376 0-73.548308-59.837538-133.376-133.376-133.376-73.538462 0-133.376 59.827692-133.376 133.376 0 13.164308 1.988923 25.858462 5.558154 37.880615l-62.579693 43.923693c-26.141538-32.430769-63.780923-55.074462-106.665846-61.986462v-75.421538c60.416-12.689231 105.937231-66.368 105.937231-130.508308C502.564923 59.827692 442.727385 0 369.188923 0 295.650462 0 235.812923 59.827692 235.812923 133.376c0 63.281231 44.342154 116.297846 103.549539 129.892923v76.401231C258.56 353.853538 196.913231 424.371692 196.913231 509.179077c0 85.220923 62.257231 155.997538 143.643077 169.698461v80.674462c-59.812923 13.147077-104.743385 66.488615-104.743385 130.200615 0 73.548308 59.837538 133.376 133.376 133.376 73.538462 0 133.376-59.827692 133.376-133.376 0-63.712-44.930462-117.053538-104.743385-130.200615v-80.676923a172.221538 172.221538 0 0 0 104.861539-60.987077l63.096615 44.659692c-3.502769 11.913846-5.464615 24.482462-5.464615 37.513846 0 73.548308 59.837538 133.376 133.376 133.376 73.538462 0 133.376-59.827692 133.376-133.376 0-73.548308-59.837538-133.376-133.376-133.376z m0-311.864615c35.660308 0 64.664615 29.016615 64.664615 64.667077s-29.004308 64.664615-64.664615 64.664615-64.664615-29.014154-64.664615-64.664615c0-35.650462 29.004308-64.667077 64.664615-64.667077z m-389.169231-121.444923c0-35.650462 29.006769-64.664615 64.667077-64.664615s64.664615 29.014154 64.664615 64.664615c0 35.650462-29.004308 64.664615-64.664615 64.664615s-64.667077-29.014154-64.667077-64.664615z m129.331692 756.376615c0 35.650462-29.004308 64.664615-64.664615 64.664616s-64.667077-29.014154-64.667077-64.664616c0-35.650462 29.006769-64.664615 64.667077-64.664615s64.664615 29.014154 64.664615 64.664615z m-64.669538-290.387692c-49.735385 0-90.195692-40.452923-90.195692-90.185846 0-49.735385 40.460308-90.195692 90.195692-90.195692 49.732923 0 90.193231 40.460308 90.193231 90.195692 0 49.732923-40.460308 90.185846-90.193231 90.185846z m324.507077 165.363692c-35.660308 0-64.664615-29.016615-64.664615-64.667077s29.004308-64.664615 64.664615-64.664615 64.664615 29.014154 64.664615 64.664615c0 35.650462-29.004308 64.667077-64.664615 64.667077z"  ></path></symbol><symbol id="iconicons8-openid" viewBox="0 0 1024 1024"><path d="M938.666667 576l-21.333334-192-61.866666 40.533333c-57.6-36.266667-130.133333-61.866667-211.2-74.666666 0 0-40.533333-8.533333-93.866667-8.533334s-102.4 6.4-102.4 6.4C241.066667 373.333333 85.333333 490.666667 85.333333 631.466667 85.333333 776.533333 245.333333 896 490.666667 917.333333v-83.2c-168.533333-23.466667-275.2-102.4-275.2-202.666666 0-93.866667 98.133333-172.8 232.533333-198.4 0 0 104.533333-23.466667 196.266667 4.266666 44.8 10.666667 85.333333 25.6 119.466666 46.933334L682.666667 533.333333l256 42.666667z" fill="#9E9E9E" ></path><path d="M490.666667 170.666667v746.666666l128-64V106.666667z"  ></path><path d="M490.666667 170.666667v746.666666l128-64V106.666667z" fill="#FF9800" ></path></symbol><symbol id="iconPrometheus_software_logo" viewBox="0 0 1035 1024"><path d="M509.008842 5.991298C227.902877 5.991298 0 233.867228 0 514.982175c0 281.105965 227.902877 508.99986 509.008842 508.99986s508.99986-227.893895 508.99986-508.99986c0-281.114947-227.902877-508.990877-508.99986-508.990877z m0 952.634386c-79.979789 0-144.82414-53.427649-144.82414-119.313965H653.832982c0 65.877333-64.844351 119.313965-144.82414 119.313965z m239.202807-158.827789H269.779088v-86.752562h478.441544v86.752562z m-1.715649-131.404351h-475.351579c-1.580912-1.823439-3.197754-3.61993-4.724772-5.470316-48.972351-59.46386-60.505825-90.507228-71.706947-122.143439-0.188632-1.041965 59.383018 12.171228 101.627509 21.674667 0 0 21.737544 5.030175 53.517473 10.82386-30.513404-35.76814-48.631018-81.237333-48.631017-127.712562 0-102.031719 78.255158-191.191579 50.023298-263.257824 27.477333 2.236632 56.86793 57.990737 58.853053 145.165474 29.210947-40.367158 41.43607-114.086175 41.43607-159.285895 0-46.798596 30.836772-101.160421 61.682526-103.01979-27.495298 45.316491 7.123088 84.165614 37.896982 180.538386 11.542456 36.199298 10.069333 97.118316 18.97993 135.75186C573.053754 301.217684 586.850807 184.140351 637.754386 143.719298c-22.45614 50.903579 3.323509 114.598175 20.95607 145.219369 28.447439 49.403509 45.693754 86.833404 45.693755 157.62414 0 47.463298-17.524772 92.151018-47.086036 127.083789 33.612351-6.305684 56.823018-11.991579 56.823018-11.991578l109.154807-21.297404c0.008982-0.008982-15.854035 65.221614-76.8 128.03593z" fill="#E6522C" ></path></symbol><symbol id="iconskywalking" viewBox="0 0 4327 1024"><path d="M1739.616604 441.967094v2.334189l-70.798491 357.875925c-9.33434 46.678943-21.782943 65.351245-69.240755 65.351245h-21.005283c-42.010566 0-63.794717-20.227623-73.909132-60.682868l-61.461735-238.06551c-0.77766-3.111849-0.77766-3.889509-2.332982-3.889509-1.556528 0-1.556528 0.77766-2.334188 3.888302l-61.461736 238.066717c-10.113208 40.455245-31.897358 60.682868-73.909132 60.682868h-21.005283c-47.456604 0-59.906415-18.672302-69.240755-65.352453L1192.718491 695.233208c-1.195472 5.047547 0.798189-1.735245 5.984603-20.34717l7.780227-27.918491 35.907622-128.876679h17.354868l36.416 251.411321c0.77766 7.001358 2.334189 10.892075 3.88951 10.892075 1.556528 0 3.890717-3.113057 5.446037-10.892075l64.573585-261.404981c7.779019-30.342038 17.115774-33.453887 43.568302-33.453887h54.457963c26.451321 0 35.788075 3.111849 43.568301 33.453887l64.572378 261.403773c1.556528 7.780226 3.890717 10.892075 5.446038 10.892076 1.556528 0 3.111849-3.889509 3.889509-10.892076l49.01434-329.089207c0.77766-7.002566 6.223698-14.003925 14.003924-14.003925h75.464453c8.557887 0 15.559245 7.001358 15.559245 15.559245z m379.539321 407.667925c0 8.557887-7.002566 15.559245-15.560453 15.559245h-66.128906c-8.557887 0-15.559245-7.001358-15.559245-15.559245v-12.448604c-35.788075 21.784151-72.353811 34.231547-109.697208 34.231547-64.573585 0-134.593208-24.896-134.593207-129.923622v-3.113057c0-88.690717 54.460377-134.592 189.830037-134.592h49.01434v-34.231547c0-50.56966-22.561811-63.017057-68.463094-63.017057-49.792 0-101.139321 3.111849-126.812981 6.223698h-3.88951c-7.780226 0-14.003925-2.334189-14.003924-13.225056v-49.792c0-8.557887 4.66717-14.003925 14.781584-16.338113 31.118491-6.223698 76.243321-12.447396 129.924831-12.447397 110.47366 0 171.157736 49.01434 171.157736 148.595925v280.077283z m-102.694642-81.690566V672.253585h-49.01434c-70.796075 0-86.356528 22.561811-86.356528 66.128906v3.113056c0 38.121057 17.115774 48.234264 56.015698 48.234264 28.007849 0 56.793358-9.33434 79.35517-21.784151z m305.630189 80.911698c0 8.557887-6.223698 16.338113-14.781585 16.338113h-72.353812c-8.557887 0-15.559245-7.780226-15.559245-16.338113V288.704c0-8.557887 7.001358-15.560453 15.559245-15.560453h72.353812c8.557887 0 14.780377 7.002566 14.780377 15.560453v560.152151z m453.448453 7.002566c0 4.66717-4.668377 9.335547-10.892076 9.335547h-94.914415c-8.557887 0-17.893434-8.557887-22.561811-15.559245l-122.144604-177.382642v176.603774c0 8.557887-7.001358 16.338113-15.559245 16.338113h-71.576151c-8.557887 0-15.559245-7.780226-15.559246-16.338113V288.704c0-8.557887 7.001358-15.560453 15.559246-15.560453h71.576151c8.557887 0 15.559245 7.002566 15.559245 15.560453v324.42083l133.035472-177.381434c5.446038-7.001358 13.226264-9.335547 17.894641-9.335547h87.135396c7.779019 0 11.669736 3.111849 11.669736 8.557887 0 2.334189-0.778868 4.668377-3.111849 7.780226l-156.377358 192.163019 157.932679 214.726038c1.556528 2.332981 2.334189 3.888302 2.334189 6.223698z m176.483018-503.36c0 8.557887-7.001358 15.559245-15.559245 15.559245h-75.464453c-8.557887 0-16.338113-7.001358-16.338113-15.559245v-68.463094c0-8.557887 7.780226-15.560453 16.338113-15.560453h75.464453c8.557887 0 15.560453 7.002566 15.560453 15.560453v68.463094z m-2.332981 496.357434c0 8.557887-7.001358 16.338113-15.559245 16.338113h-71.576151c-8.557887 0-15.559245-7.780226-15.559245-16.338113V441.967094c0-8.557887 7.001358-15.559245 15.559245-15.559245h71.576151c8.557887 0 15.559245 7.001358 15.559245 15.559245V848.857358z m458.11683 0c0 8.557887-7.002566 16.338113-15.560452 16.338113h-71.574944c-8.557887 0-15.559245-7.780226-15.559245-16.338113V595.231396c0-67.685434-6.223698-87.134189-66.130113-87.134188-26.451321 0-55.23683 10.892075-87.911849 28.006641V848.857358c0 8.557887-7.002566 16.338113-15.560453 16.338114h-71.574944c-8.557887 0-15.559245-7.780226-15.559245-16.338114V441.967094c0-8.557887 7.001358-15.559245 15.559245-15.559245h67.685434c8.557887 0 15.559245 7.001358 15.559246 15.559245v16.338114c45.123623-28.785509 74.686792-37.343396 126.03532-37.343397 112.030189 0 134.592 75.46566 134.592 174.269585V848.857358z m478.344453-368.766793c0 11.669736-3.111849 13.225057-12.448603 17.115774l-25.672453 10.113208c12.447396 17.894642 19.448755 35.010415 19.448754 62.239396v5.446038c0 97.248604-66.906566 141.594566-184.384 141.594566-41.232906 0-69.240755-7.002566-84.8-13.226265-9.336755 6.223698-13.226264 13.226264-13.226264 20.227623 0 15.560453 8.557887 21.784151 26.451321 25.67366l91.802566 21.784151c105.807698 24.896 174.270792 41.232906 174.270792 124.478793v5.446038c0 79.353962-58.348679 122.143396-190.607698 122.143396-126.035321 0-192.941887-47.456604-192.941886-129.145962v-7.001359c0-31.898566 14.781585-63.017057 39.677584-85.578868-21.784151-16.338113-35.009208-43.568302-35.009207-71.576151v-0.77766c0-24.117132 10.113208-48.235472 31.118491-63.017057-23.339472-24.117132-31.897358-52.124981-31.897359-91.024905v-5.446038c0-77.798642 50.56966-143.149887 185.16166-143.149887h182.049812a20.91834 20.91834 0 0 1 21.00649 21.005283v32.676226zM3766.339623 577.337962v-6.223698c0-37.343396-16.338113-66.128906-83.245887-66.128906-66.128906 0-84.02234 29.56317-84.02234 66.128906v6.223698c0 28.785509 11.669736 61.461736 84.02234 61.461736 64.573585 0 83.245887-22.561811 83.245887-61.461736z m8.557886 323.644378v-5.446038c0-17.115774-10.114415-27.230189-91.803773-46.680151l-69.240755-16.338113c-11.669736 16.338113-19.449962 26.452528-19.449962 54.460377v7.001359c0 31.897358 19.449962 51.347321 92.581434 51.34732 74.686792 0 87.913057-16.338113 87.913056-44.344754zM374.123472 607.081057c0 78.577509-49.01434 162.599849-204.611623 162.599849-58.348679 0-100.360453-5.446038-137.703849-14.003925-7.780226-1.555321-14.781585-7.001358-14.781585-15.559245v-56.015698c0-8.557887 7.001358-14.781585 14.780377-14.781585h1.557736c31.118491 3.889509 108.91834 7.780226 137.703849 7.780226 69.240755 0 90.246038-24.896 90.246038-70.019622 0-30.342038-14.780377-45.901283-66.128906-76.243321l-102.694641-61.460528C20.138264 426.587774 0.688302 381.464151 0.688302 327.003774c0-85.578868 49.790792-147.818264 194.497207-147.818265 51.347321 0 122.922264 7.779019 149.373585 14.003925 7.780226 1.555321 14.005132 7.001358 14.005132 14.780377v57.572227c0 7.780226-5.446038 14.003925-13.226264 14.003924h-1.556528c-51.347321-4.668377-102.694642-7.780226-153.263094-7.780226-57.572226 0-81.690566 20.227623-81.690566 55.238038 0 25.672453 13.227472 41.232906 63.795924 69.240754l93.359094 52.124981c85.578868 47.456604 108.140679 97.248604 108.14068 158.71034z m433.99849 147.040603c0 4.66717-4.66717 9.33434-10.892075 9.33434h-94.913208c-8.559094 0-17.895849-8.556679-22.563019-15.559245l-122.143396-177.381434v176.603773c0 8.557887-7.003774 16.338113-15.560453 16.338114h-71.574943c-8.557887 0-15.560453-7.780226-15.560453-16.338114V186.965736c0-8.557887 7.002566-15.559245 15.560453-15.559245h71.574943c8.557887 0 15.559245 7.001358 15.559246 15.559245v324.422038L690.645736 334.007547c5.446038-7.001358 13.226264-9.335547 17.893434-9.335547h87.135396c7.780226 0 11.669736 3.111849 11.669736 8.557887 0 2.334189-0.77766 4.66717-3.111849 7.780226L647.856302 533.171925l157.932679 214.726037c1.555321 2.332981 2.332981 3.888302 2.332981 6.223698z m434.777359-416.225811c0 1.556528 0 3.113057-0.777661 4.668377L1112.19683 796.911094c-24.117132 84.8-52.902642 122.143396-158.710339 122.143397-25.672453 0-64.572377-4.66717-82.467019-10.113208-8.557887-2.334189-16.338113-5.446038-16.338114-13.226264v-49.790793c0-8.557887 7.002566-14.003925 15.560453-14.003924h1.556529c21.784151 0.77766 66.128906 4.668377 87.911849 4.668377 33.453887 0 50.56966-9.336755 61.461736-49.792l6.223698-23.339471h-11.669736c-22.561811 0-50.56966-5.446038-67.685434-64.573585l-101.916981-356.319397c-0.77766-2.334189-0.77766-3.889509-0.777661-5.446037 0-7.780226 4.668377-12.447396 14.782793-12.447397h78.576302c7.002566 0 13.226264 7.001358 14.781585 14.003925l78.577509 316.641811c3.111849 13.226264 6.223698 17.115774 10.892075 17.115774h7.001359l84.023547-334.536453c1.555321-7.001358 7.779019-13.225057 15.559245-13.225057h79.35517c7.780226 0 14.003925 6.223698 14.003925 13.225057z" fill="#1890FF" ></path><path d="M3643.813434 155.203623c21.086189-4.692528 42.908981-7.631698 64.788528-8.777661 219.435472-11.499472 406.839547 158.192302 418.404227 378.855849 3.95834 75.522415-14.055849 150.439849-50.383698 215.553208 154.855849-55.217509 259.634717-206.250264 250.596226-378.724227-11.004377-209.968302-189.681509-371.759094-398.479698-360.815094-114.165132 5.982189-218.470642 63.932377-284.925585 153.907925z" fill="#D8D8D8" ></path></symbol></svg>',
    p = (p = document.getElementsByTagName('script'))[p.length - 1].getAttribute('data-injectcss');
  if (p && !l.__iconfont__svg__cssinject__) {
    l.__iconfont__svg__cssinject__ = !0;
    try {
      document.write(
        '<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>',
      );
    } catch (l) {
      console && console.log(l);
    }
  }
  function o() {
    i || ((i = !0), t());
  }
  (c = function () {
    var l, c, h, t;
    ((t = document.createElement('div')).innerHTML = z),
      (z = null),
      (h = t.getElementsByTagName('svg')[0]) &&
        (h.setAttribute('aria-hidden', 'true'),
        (h.style.position = 'absolute'),
        (h.style.width = 0),
        (h.style.height = 0),
        (h.style.overflow = 'hidden'),
        (l = h),
        (c = document.body).firstChild
          ? ((t = l), (h = c.firstChild).parentNode.insertBefore(t, h))
          : c.appendChild(l));
  }),
    document.addEventListener
      ? ~['complete', 'loaded', 'interactive'].indexOf(document.readyState)
        ? setTimeout(c, 0)
        : ((h = function () {
            document.removeEventListener('DOMContentLoaded', h, !1), c();
          }),
          document.addEventListener('DOMContentLoaded', h, !1))
      : document.attachEvent &&
        ((t = c),
        (a = l.document),
        (i = !1),
        (e = function () {
          try {
            a.documentElement.doScroll('left');
          } catch (l) {
            return void setTimeout(e, 50);
          }
          o();
        })(),
        (a.onreadystatechange = function () {
          'complete' == a.readyState && ((a.onreadystatechange = null), o());
        }));
})(window);
