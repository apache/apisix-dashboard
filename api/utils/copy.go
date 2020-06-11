package utils

func CopyMap(origin map[string]interface{}) map[string]interface{} {
	result := make(map[string]interface{})
	for k, v := range origin {
		result[k] = v
	}
	return result
}

func CopyStrings(origin [][]string) [][]string {
	result := make([][]string, 0)
	for _, s := range origin {
		result = append(result, s)
	}
	return result
}

func Set2Map(origin []string) map[string]int {
	result := make(map[string]int)
	for _, s := range origin {
		result[s] = 1
	}
	return result
}
