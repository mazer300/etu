def PrintSubarrays(subarrays):
    for i in range(len(subarrays)):
        subarray = list(map(str, subarrays[i]))
        subarray_str = " ".join(subarray)
        print(f"Part {i}: {subarray_str}")
