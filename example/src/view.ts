import { WaveView } from '../../src/index';

document.addEventListener('DOMContentLoaded', async () => {
    // Some audio amplitude data
    const data = [
        0.0, -0.0, 0.0, -0.0, -0.255748, 0.349315, -0.006503, 0.629207, 0.455342, -0.511476, 0.297436, 0.536599,
        -0.274228, -0.423092, 0.314882, 0.372856, -0.2524, 0.207838, 0.389793, -0.471078, 0.35892, -0.436719, -0.515745,
        -0.0, 0.0, -0.043236, -0.061526, -0.19558, -0.0, 0.175342, -0.0, -0.020881, 0.0, 0.0, -0.0, 0.0, 0.00398, 0.0,
        -0.0, 0.0, 0.0, -0.0, 0.0, 0.0, 0.0, -0.0, -0.0, 0.0, -0.0, -0.0, 0.0, -0.0, -0.0, -0.0, 0.0, -0.0, 0.0, -0.0,
        -0.0, 0.0, -0.0, 0.0, 0.0, 0.0, -0.0, -0.0, -0.0, 0.0, 0.0, 0.086806, -0.0, -0.180784, -0.0, 0.230699, 0.319184,
        -0.153253, 0.106934, -0.265392, -0.386672, -0.416478, 0.457198, -0.364309, 0.247725, 0.745242, -0.561628,
        -0.818346, -0.547704, 0.0, 0.469329, 0.277287, 0.637802, -0.531759, 0.708651, 0.708866, 0.503952, -0.665665,
        -0.582711, 0.652437, -0.447975, -0.648337, 0.707466, -0.340578, 0.730583, 0.628647, 0.469601, -0.384014,
        -0.560213, 0.658259, -0.584771, 0.333913, 0.623001, 0.605161, -0.034752, 0.179236, 0.505244, -0.043263,
        -0.131494, 0.246331, 0.232819, 0.270121, 0.20368, 0.343662, -0.0, -0.09612, 0.072505, -0.100913, -0.169411,
        0.472229, 0.0, 0.534057, -0.080575, 0.257711, -0.392131, 0.286033, 0.387765, -0.256383, 0.285962, -0.309771,
        0.350085, 0.070848, -0.102709, 0.215918, -0.08201, 0.0, 0.44489, -0.297627, -0.451123, -0.0, 0.382111,
        -0.583438, 0.0, 0.311498, -0.521646, -0.220385, 0.0, 0.552397, 0.483971, 0.020722, 0.35208, -0.602431,
        -0.254794, -0.520484, -0.406913, 0.416983, 0.42026, 0.311891, -0.59731, -0.63515, 0.039539, -0.428418, 0.0,
        0.392774, 0.159181, -0.550874, 0.473662, 0.588043, 0.385478, 0.471496, 0.298194, 0.583622, -0.365834, 0.448625,
        0.464332, -0.223312, -0.37246, 0.187548, -0.132774, -0.464835, 0.26408, -0.000279, 0.220567, -0.113215,
        0.527352, 0.406437, -0.30567, -0.561602, 0.211035, 0.239677, 0.586987, 0.548565, 0.439832, -0.458591, 0.373433,
        0.38643, -0.429056, -0.430582, 0.561546, 0.401058, -0.480977, -0.543163, 0.471382, -0.715856, -0.550976,
        -0.286751, -0.713027, -0.59362, -0.760673, -0.589936, -0.27032, 0.808887, 0.554674, 0.485325, -0.912225,
        0.646289, -0.764666, 0.713641, 0.298781, -0.196471, -0.291065, 0.449239, 0.709693, -0.219103, 0.476211,
        0.703556, 0.936303, 0.743551, 0.69078, -0.648028, -0.0, -0.095704, -0.674797, -0.839674, 0.589681, -0.599526,
        -0.787625, 0.585161, 0.844452, -0.283296, 0.696979, -0.360923, 0.73524, 0.749487, 0.685366, 0.371701, 1.0,
        0.590543, -0.837612, -0.420744, -0.850094, -0.526415, 0.652238, -0.507159, -0.895539, -0.823544, 0.114093,
        -0.317326, 0.528289, -0.576128, 0.074788, -0.302684, -0.494038, 0.736564, 0.678638, -0.620414, 0.640078,
        0.498448, 0.265735, -0.506662, 0.605814, -0.537456, -0.668938, 0.452512, 0.653067, 0.63038, -0.625998, 0.494835,
        -0.729459, 0.497225, 0.78054, 0.627076, -0.742383, -0.588446, -0.848737, 0.764681, 0.86665, -0.328456, 0.556975,
        -0.704223, -0.663696, 0.546689, -0.616215, -0.830657, -0.725595, 0.931373, -0.573786, -0.584203, -0.769187,
        0.838269, -0.876203, -0.865187, -0.766679, -0.524843, -0.338822, -0.871196, -0.777545, 0.567669, 0.54923,
        -0.595338, -0.764853, -0.594398, 0.927006, -0.54166, 0.707739, -0.625201, 0.811964, 0.845028, -0.531003, -0.0,
        0.705411, 0.564875, -0.53527, 0.661075, 0.649274, 0.608509, -0.103933, -0.835493, -0.610152, -0.723465,
        -0.465305, -0.445618, 0.68996, -0.850607, 0.68691, -0.295536, 0.627219, -0.0, 0.562786, 0.440983, -0.590306,
        -0.700787, 0.49042, 0.701361, -0.468033, 0.682693, -0.756013, -0.621585, 0.597562, 0.722338, 0.480014, 0.448674,
        -0.551014, -0.605941, -0.50785, -0.610728, -0.099352, 0.523123, 0.430482, 0.481791, 0.477237, 0.304185,
        -0.450503, -0.474803, -0.53061, 0.201166, -0.444011, -0.203846, -0.06313, -0.0, 0.410406, 0.295773, -0.14325,
        0.148329, -0.0, 0.324283, -0.431037, 0.0, -0.580748, 0.0, 0.365953, 0.0, 0.332848, 0.212148, 0.450699, 0.440623,
        0.476761, 0.004986, -0.548737, -0.389024, 0.037273, 0.461427, 0.466677, -0.288389, -0.065075, 0.000539, 0.47034,
        -0.384389, -0.399975, -0.521541, -0.516086, 0.694657, 0.0, 0.566136, 0.556882, -0.608773, -0.257121, 0.69597,
        -0.733665, -0.0, 0.753907, -0.919236, 0.407259, 0.891567, 0.691111, 0.232167, -0.620267, -0.696353, 0.4246,
        -0.643987, 0.611933, -0.0, 0.844283, 0.543365, -0.791825, -0.0, -0.642509, -0.656627, 0.550105, 0.605827,
        0.6012, -0.892638, 0.639391, 0.04586, -0.619757, -0.414646, -0.793555, -0.636592, -0.906201, 0.864197, 0.614323,
        -0.702281, 0.839445, -0.60472, 0.817341, -0.744916, 0.804651, -0.621289, -0.45288, 0.750929, -0.778959,
        0.730366, -0.762216, -0.691816, 0.816145, -0.682943, 0.862809, -0.812854, 0.831321, -0.574102, -0.500973,
        0.745756, -0.921143, 0.932697, -0.890813, 0.751849, -0.749223, 0.651988, -0.581427, 0.623007, -0.657772,
        -0.665148, -0.647858, -0.63131, 0.686994, 0.471566, 0.342904, -0.325632, 0.626374, -0.491437, 0.597911,
        -0.14647, -0.598389, 0.320791, -0.521412, 0.442859, 0.317316, 0.0, -0.560898, -0.387749, -0.395698, -0.700365,
        0.39389, 0.72082, -0.700299, -0.547115, 0.428599, -0.569869, -0.575818, -0.0, -0.196085, -0.573722, 0.482517,
        -0.536557, -0.44235, -0.346873, 0.528198, 0.568688, 0.50145, 0.336265, 0.154892, 0.13258, 0.054525, -0.0,
        0.344421, 0.181959, 0.175495, -0.488912, 0.214135, 0.371089, -0.258838, -0.296043, -0.195904, 0.355021,
        0.113083, -0.240046, 0.0, 0.095069, -0.0, -0.071727, 0.0, 0.0, 0.037942, 0.222624, 0.19681, 0.060576, 0.195547,
        0.087069, 0.153877, 0.0, 0.0, -0.102919, -0.0, -0.157207, -0.142217, -0.0, 0.0, -0.0, -0.338654, -0.486394,
        -0.393927, -0.446284, 0.0, -0.181623, 0.0, -0.027874, -0.464425, -0.25126, -0.199082, 0.009318, 0.077419, 0.0,
        0.134346, -0.0, 0.066677, 0.0, -0.0, -0.0, 0.0, -0.0, -0.0, -0.087619, -0.043425, -0.207262, -0.433039,
        -0.191249, 0.556031, 0.576648, -0.299038, -0.413884, -0.470111, -0.302894, -0.204366, -0.395743, -0.315047,
        -0.248048, -0.284633, -0.357971, -0.362704, -0.352291, -0.213203, -0.234513, -0.226957, -0.112991, 0.166451,
        -0.255417, -0.462053, 0.228897, 0.10096, 0.384098, 0.247262, 0.572677, 0.560519, 0.19654, 0.432672, 0.323359,
        0.0, 0.246872, 0.240055, 0.005313, -0.108272, -0.0, -0.0, 0.137759, -0.0, 0.0, 0.121889, 0.083733, 0.0,
        -0.15809, 0.411049, -0.471751, 0.456534, 0.396262, -0.401205, -0.360394, 0.083235, -0.257883, -0.162991,
        0.245272, -0.041678, 0.0, 0.299742, 0.217314, -0.145599, 0.058869, -0.316457, -0.091093, 0.0, 0.388772,
        -0.265143, 0.425687, 0.58125, 0.437481, -0.566214, 0.841203, -0.760133, 0.462662, 0.61554, -0.499927, 0.337606,
        0.453534, -0.241952, 0.240954, 0.564081, -0.462022, -0.375077, -0.304089, -0.247084, 0.347607, 0.377737,
        -0.396561, -0.321123, 0.430045, 0.0, -0.346254, -0.178055, 0.0, 0.367142, 0.548399, -0.464045, 0.505173,
        -0.081276, -0.251381, 0.484004, 0.219745, -0.217503, 0.17565, 0.0, -0.332748, 0.275359, 0.219873, 0.218618,
        -0.078351, -0.132128, -0.279822, -0.346438, -0.001782, 0.14482, 0.536229, 0.446524, -0.219028, 0.417714,
        -0.032379, -0.305385, 0.101168, 0.0, 0.348011, 0.0, 0.0, -0.0, 0.407233, 0.460614, 0.34977, 0.552305, -0.325524,
        -0.444327, 0.464945, -0.64667, -0.531264, 0.313881, -0.69494, -0.533515, 0.599779, -0.675423, 0.0, -0.0, 0.0,
        -0.0, -0.0, -0.0, 0.0, 0.0, 0.0, -0.0, -0.0, -0.0, 0.0, 0.0, 0.0, -0.0, 0.0, -0.0, 0.042048, -0.07707, 0.059136,
        -0.0, 0.0, -0.0, 0.096876, 0.000916, 0.0, 0.0, -0.0, -0.0, 0.0, 0.0, 0.0, 0.0, -0.0, -0.0, -0.0, -0.0, 0.0, 0.0,
        -0.0, -0.0, -0.0, -0.0, -0.0, 0.0, -0.0, -0.0, 0.0, -0.0, -0.0, 0.0, 0.0, -0.0, 0.0, 0.0, -0.0, 0.0, 0.0, -0.0,
        -0.0, 0.0, -0.0, -0.0, 0.0, -0.0, -0.0, -0.0, 0.0, 0.0, -0.0, 0.0, 0.0, -0.0, -0.0, 0.0, 0.0,
    ];

    // Create a new wave view instance
    const view = new WaveView(data, { container: '#waveform' });

    // Render the wave view
    view.render();
});
