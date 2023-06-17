<script lang="ts">
    import 'tabulator-tables/dist/css/tabulator_bulma.min.css';
    import Menu from '@smui/menu';
    import List, { Item, Text } from '@smui/list';
    import Button, { Group } from '@smui/button';
    import { column, autoFilter, comboBoxEditor, progressColumn } from './column.helper';
    import { favColumn, statusFormatter, genreFormatter, labelFormatter } from './formatter.helper';
    import type { TabulatorFull as Tabulator, ColumnDefinition } from 'tabulator-tables';
    import Table from './Table.svelte'
    import FileDrop from './FileDrop.svelte';
    import type { Song } from '../../model/song.model';
    import type { Observable } from 'rxjs';
    import { songs } from '../../store/song.store';

    let exportMenu: Menu;
    let table: Observable<Tabulator>;

    // https://tabulator.info/docs/5.4/edit#editor-list
    const columns: ColumnDefinition[] = [
      column("✩", "fav", "4%", undefined, favColumn),
      column("?", "status", "4%", "string", autoFilter, statusFormatter),
      column("Progress", "progress", "14%", "number", progressColumn, { editor: 'range' }),
      column("Title", "title", "25%", "string", autoFilter, { editor: 'input' }),
      column("Artist", "artist", "25%", "string", autoFilter, comboBoxEditor),
      column("Genre", "genre", "14%", "string", autoFilter, genreFormatter, comboBoxEditor),
      column("Labels", "tags", "14%", "string", autoFilter, labelFormatter, { editor: 'input' }),
      column("Learned", "learnedOn", "14%", "date", autoFilter, { editor: 'input' }),
    ];

    const newSong = (): Song => ({ status: 'todo', progress: 0, tags: [] } as Song);
        
    function importJSON(data: string) {
      const json = JSON.parse(data) as Song[];
      if (json) {
        songs.set(json);
      }
    }

    $: {
      if ($table) {
        $table.replaceData($songs);
      }
    }
</script>

<div>
  <div id="export-menu">
    <Group>
      <Button title="add row before" variant="raised" color="secondary" on:click={() => songs.unshift(newSong())}>+[]</Button>
      <Button title="add row after" variant="raised" color="secondary" on:click={() => songs.push(newSong())}>[]+</Button>
    </Group>
    <Button title="export table data" variant="raised" color="secondary" on:click={() => exportMenu.setOpen(true)}>Export</Button>
    <Menu bind:this={exportMenu}>
      <List>
        <Item on:SMUI:action={() => ($table.download("csv", "songs.csv", { delimiter: ";" }))}>
          <Text>CSV</Text>
        </Item>
        <Item on:SMUI:action={() => ($table.download("json", "songs.json"))}>
          <Text>JSON</Text>
        </Item>
        <Item on:SMUI:action={() => ($table.download("xlsx", "songs.xlsx", { sheetName: "My song repertoire" }))}>
          <Text>XLSX</Text>
        </Item>
        <Item on:SMUI:action={() => ($table.download("pdf", "songs.pdf", { title: "My song repertoire" }))}>
          <Text>PDF</Text>
        </Item>
      </List>
    </Menu>
  </div>
  
  <FileDrop on:addJson="{({ detail }) => importJSON(detail)}">
    <Table bind:element={table} {columns} />
  </FileDrop>
</div>

<style>
    div {
        margin: 4px;
    }

    div#export-menu {
      display: inline-block;
      min-width: 100px;
    }

    :global(div.tabulator-cell.fav) {
      font-size: larger;
      color: lightgray;
    }

    :global(div.tabulator-cell.fav.active) {
      color: gold;
    }

    :global(div.tabulator-cell.status) {
      font-weight: bold;
    }

    :global(div.tabulator-cell.status.unkown::before) {
      content: '?';
      color: silver;
    }

    :global(div.tabulator-cell.status.todo::before) {
      content: ' ';
    }

    :global(div.tabulator-cell.status.wip::before) {
      content: '>';
      color: orange
    }

    :global(div.tabulator-cell.status.done::before) {
      content: '✓';
      color: green
    }

    :global(div.tabulator-cell.status.repeat::before) {
      content: '<';
      color: red;
    }

    :global(div.tabulator-cell.status.removed::before) {
      content: '✗';
      color: purple;
    }
</style>
  