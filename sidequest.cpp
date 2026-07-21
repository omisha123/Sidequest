#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <cstdlib>
#include <ctime>

using namespace std;

vector<string> getWords(string fname) {
    vector<string> list;
    ifstream fin(fname);

    if (!fin.is_open()) return list;

    string str;
    while (fin >> str) {
        for (int i = 0; i < str.length(); i++) {
            str[i] = tolower(str[i]);
        }
        if (str.length() == 5) list.push_back(str);
    }
    return list;
}

bool checkWord(string w, string g, string fb) {
    for (int i = 0; i < 5; i++) {
        if (fb[i] == '2' && w[i] != g[i]) return false;
        if (fb[i] == '1' && w[i] == g[i]) return false;
    }

    int need[26] = {0};
    bool bad[26] = {false};
    for (int i = 0; i < 5; i++) {
        int idx = g[i] - 'a';
        if (fb[i] == '0') bad[idx] = true;
        else need[idx]++;
    }

    int count[26] = {0};
    for (int i = 0; i < 5; i++) {
        count[w[i] - 'a']++;
    }

    for (int i = 0; i < 5; i++) {
        int idx = g[i] - 'a';
        if (count[idx] < need[idx]) return false;
        if (bad[idx] && count[idx] != need[idx]) return false;
    }

    return true;
}

string pickWord(vector<string>& list, bool first) {
    int freq[26] = {0};

    for (int i = 0; i < list.size(); i++) {
        bool used[26] = {false};
        for (int j = 0; j < 5; j++) {
            used[list[i][j] - 'a'] = true;
        }
        for (int k = 0; k < 26; k++) {
            if (used[k]) freq[k]++;
        }
    }

    int maxScore = -1;
    vector<int> scores(list.size(), 0);

    for (int i = 0; i < list.size(); i++) {
        bool used[26] = {false};
        int s = 0;

        for (int j = 0; j < 5; j++) {
            int idx = list[i][j] - 'a';
            if (!used[idx]) {
                used[idx] = true;
                s += freq[idx];
            }
        }

        scores[i] = s;
        if (s > maxScore) maxScore = s;
    }

    if (first && maxScore > 0) {
        vector<string> top;
        for (int i = 0; i < list.size(); i++) {
            if (scores[i] >= maxScore * 0.90) {
                top.push_back(list[i]);
            }
        }
        return top[rand() % top.size()];
    }

    for (int i = 0; i < list.size(); i++) {
        if (scores[i] == maxScore) return list[i];
    }

    return list[0];
}

int main() {
    srand(time(0));

    vector<string> words = getWords("words.txt");
    if (words.empty()) return 1;

    cout << "words loaded: " << words.size() << "\n";

    for (int t = 1; t <= 6; t++) {
        if (words.empty()) {
            cout << "no words left\n";
            break;
        }

        string g = pickWord(words, t == 1);
        cout << "try: " << g << "\n";

        cout << "typed: ";
        string input;
        cin >> input;

        for (int i = 0; i < input.length(); i++) {
            input[i] = tolower(input[i]);
        }

        cout << "feedback: ";
        string fb;
        cin >> fb;

        if (fb == "22222") {
            cout << "win in " << t << "!\n";
            return 0;
        }

        vector<string> temp;
        for (int i = 0; i < words.size(); i++) {
            if (checkWord(words[i], input, fb)) {
                temp.push_back(words[i]);
            }
        }
        words = temp;
    }

    return 0;
}